// mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./app"],
          alias: {
            "@": "./app",
            "@assets": "./app/assets",
            "@components": "./app/components",
            "@utils": "./app/utils",
            "@config": "./app/config",
            "@auth": "./app/(auth)",
            "@user": "./app/(user)",
            "@bsn": "./app/(bsn)",
          },
        },
      ],
    ],
  };
};
