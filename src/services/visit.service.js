const { Visit } = require('../models');
const getInfoClient = require('../utils/getInfoClient');

/**
 * Record a new visit
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} The created visit record
 */
const recordVisit = async (req) => {
  const { userIP } = getInfoClient(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || '';
  const path = req.headers['origin'] || '';

  const visit = await Visit.create({
    ip: userIP,
    userAgent,
    referrer,
    path,
  });

  return visit;
};

/**
 * Get visit statistics
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Visit statistics
 */
const getVisitStatistics = async (query) => {
  const { startDate, endDate, filterBy = 'day' } = query;
  
  // Define the date range for the query
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Default to last 30 days if no date range is specified
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    dateFilter.date = {
      $gte: thirtyDaysAgo,
      $lte: now,
    };
  }

  // Define time grouping based on filter
  let timeGrouping;
  let sortStage;
  let projectStage;
  
  switch (filterBy) {
    case 'day':
      timeGrouping = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' },
      };
      sortStage = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      projectStage = {
        _id: 0,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              },
            },
          },
        },
        count: 1,
      };
      break;
    case 'week':
      timeGrouping = {
        year: { $year: '$date' },
        week: { $week: '$date' },
      };
      sortStage = { '_id.year': 1, '_id.week': 1 };
      projectStage = {
        _id: 0,
        week: {
          $concat: [
            { $toString: '$_id.year' },
            '-W',
            { $toString: '$_id.week' },
          ],
        },
        count: 1,
      };
      break;
    case 'month':
      timeGrouping = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
      sortStage = { '_id.year': 1, '_id.month': 1 };
      projectStage = {
        _id: 0,
        month: {
          $dateToString: {
            format: '%Y-%m',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: 1,
              },
            },
          },
        },
        count: 1,
      };
      break;
    case 'year':
      timeGrouping = {
        year: { $year: '$date' },
      };
      sortStage = { '_id.year': 1 };
      projectStage = {
        _id: 0,
        year: '$_id.year',
        count: 1,
      };
      break;
    default:
      timeGrouping = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' },
      };
      sortStage = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      projectStage = {
        _id: 0,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              },
            },
          },
        },
        count: 1,
      };
  }

  // Get total visits
  const totalVisits = await Visit.countDocuments(dateFilter);

  // Get visits by time period
  const visitsByTime = await Visit.aggregate([
    { $match: dateFilter },
    { $group: { _id: timeGrouping, count: { $sum: 1 } } },
    { $sort: sortStage },
    { $project: projectStage },
  ]);

  // Get unique visitors (by IP)
  const uniqueVisitors = await Visit.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$ip' } },
    { $count: 'count' },
  ]);

  // Get top browsers
  const topBrowsers = await Visit.aggregate([
    { $match: dateFilter },
    {
      $addFields: {
        browser: {
          $cond: {
            if: { $regexMatch: { input: '$userAgent', regex: /Chrome/ } },
            then: 'Chrome',
            else: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: /Firefox/ } },
                then: 'Firefox',
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$userAgent', regex: /Safari/ } },
                    then: 'Safari',
                    else: {
                      $cond: {
                        if: { $regexMatch: { input: '$userAgent', regex: /Edge/ } },
                        then: 'Edge',
                        else: {
                          $cond: {
                            if: { $regexMatch: { input: '$userAgent', regex: /MSIE|Trident/ } },
                            then: 'Internet Explorer',
                            else: 'Other',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, browser: '$_id', count: 1 } },
  ]);

  return {
    period: {
      startDate: dateFilter.date.$gte,
      endDate: dateFilter.date.$lte,
      filterBy,
    },
    totalVisits,
    uniqueVisitors: uniqueVisitors.length > 0 ? uniqueVisitors[0].count : 0,
    visitsByTime,
    topBrowsers,
  };
};

module.exports = {
  recordVisit,
  getVisitStatistics,
};
