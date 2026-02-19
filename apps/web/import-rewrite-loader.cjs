// Rewrites `from "<file>.js";` into `from "<file>";` to make ESM imports work in turbopack
// eslint-disable-next-line no-undef
module.exports = function stripExtensions(source) {
  return source.replaceAll(
    /(from\s+["'].*?)(\.js)(['"];?)$/gm, '$1$3',
  );
};
