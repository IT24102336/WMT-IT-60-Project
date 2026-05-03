const path = require("path");

const loadModuleWithMocks = (modulePath, mocks = {}) => {
  const resolvedModulePath = require.resolve(path.resolve(process.cwd(), modulePath));
  const moduleDir = path.dirname(resolvedModulePath);
  const originalEntries = new Map();

  for (const [request, mockExports] of Object.entries(mocks)) {
    const resolvedDependency = require.resolve(request, { paths: [moduleDir] });
    originalEntries.set(resolvedDependency, require.cache[resolvedDependency]);
    require.cache[resolvedDependency] = {
      id: resolvedDependency,
      filename: resolvedDependency,
      loaded: true,
      exports: mockExports
    };
  }

  delete require.cache[resolvedModulePath];

  try {
    return require(resolvedModulePath);
  } finally {
    delete require.cache[resolvedModulePath];

    for (const [resolvedDependency, originalEntry] of originalEntries.entries()) {
      if (originalEntry) {
        require.cache[resolvedDependency] = originalEntry;
      } else {
        delete require.cache[resolvedDependency];
      }
    }
  }
};

module.exports = {
  loadModuleWithMocks
};
