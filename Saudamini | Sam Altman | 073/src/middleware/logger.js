/**
 * Custom request logging middleware
 * Logs: [Method] [URL] [Timestamp] [User/IP]
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.user ? `${req.user.email} (${req.user.role})` : `Guest (${ip})`;
    const status = res.statusCode;

    console.log(
      `[${timestamp}] [${method}] ${url} - Status: ${status} - User: ${user} - Duration: ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
