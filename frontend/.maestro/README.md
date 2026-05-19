# E2E amb Maestro

Fluxos UI sobre dispositiu o emulador (app nativa `com.ego.app`).

## Requisits

1. [Maestro CLI](https://maestro.mobile.dev/docs/getting-started/installation) instal·lat
2. App compilada i instal·lada: `npx expo run:android` (o iOS)
3. Backend accessible des del dispositiu
4. **Sessió iniciada** a la pantalla del mapa

## Flux: cerca → panell estació

```bash
cd frontend
maestro test .maestro/flows/search-station-opens-panel.yaml
```

El flux escriu `Punt` al buscador i espera un resultat amb `testID` `search-result-station-42`. Per Maestro en entorn real, assegura’t que existeix una estació amb `id: 42` al backend o adapta el `testID` / el text del flux al teu entorn.

## E2E en CI (sense emulador)

```bash
npm run test:e2e
```

Executa el mateix flux amb Jest + Testing Library (`tests/e2e/searchStationPanel.e2e.test.tsx`), sense mock del `TopBar`.
