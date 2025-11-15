// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:path*',   // any path
        destination: '/',     // serve the index page
      },
    ];
  },
};
