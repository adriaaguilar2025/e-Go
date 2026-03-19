export default ({ config }) => {
  return {
    ...config, // Carga todo tu app.json original
    android: {
      ...config.android,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY // Inyecta la llave secreta
        }
      }
    }
  };
};