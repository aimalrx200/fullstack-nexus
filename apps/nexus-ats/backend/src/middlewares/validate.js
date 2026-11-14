// apps/nexus-ats/backend/src/middlewares/validate.js

export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }

    if (schema.query) {
      const parsedQuery = schema.query.parse(req.query);
      // Express 5: Safely redefine getter-only query property on request instance
      Object.defineProperty(req, "query", {
        value: parsedQuery,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    if (schema.params) {
      const parsedParams = schema.params.parse(req.params);
      // Express 5: Safely redefine params property on request instance
      Object.defineProperty(req, "params", {
        value: parsedParams,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
