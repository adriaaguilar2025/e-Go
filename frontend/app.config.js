const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

module.exports = ({ config }) => {
  const expo = appJson.expo || {};
  return {
    ...config,
    ...expo,
    ios: {
      ...(expo.ios || {}),
      config: {
        ...(expo.ios?.config || {}),
        googleMapsApiKey,
      },
    },
    android: {
      ...(expo.android || {}),
      config: {
        ...(expo.android?.config || {}),
        googleMaps: {
          ...(expo.android?.config?.googleMaps || {}),
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
