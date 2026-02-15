module.exports = {
  moduleNameMapper: {
    '^@step-wise/([^/]+)/(.*)$': '<rootDir>/packages/$1/dist/$2/index.js', // Package subpath
    '^@step-wise/([^/]+)$': '<rootDir>/packages/$1/dist/index.js', // Package root
  },
};