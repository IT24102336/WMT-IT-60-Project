const invokeHandler = async (handler, { req = {} } = {}) => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  let forwardedError;
  await handler(req, response, (error) => {
    forwardedError = error;
  });

  return {
    res: response,
    error: forwardedError
  };
};

const getFutureDate = ({ daysAhead = 1, hour = 9, minute = 0, weekdayOnly = false } = {}) => {
  const date = new Date();
  date.setSeconds(0, 0);

  while (daysAhead > 0 || (weekdayOnly && (date.getDay() === 0 || date.getDay() === 6))) {
    date.setDate(date.getDate() + 1);
    if (daysAhead > 0) {
      daysAhead -= 1;
    }
  }

  date.setHours(hour, minute, 0, 0);
  return date;
};

const toDateOnly = (date) => date.toISOString().slice(0, 10);

module.exports = {
  invokeHandler,
  getFutureDate,
  toDateOnly
};
