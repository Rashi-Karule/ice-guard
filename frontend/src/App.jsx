import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { VoyagePanel } from './components/VoyagePanel';
import { Headline } from './components/Headline';
import { RouteTable } from './components/RouteTable';
import { AdvisorCard } from './components/AdvisorCard';
import { DataSourceBar } from './components/DataSourceBar';
import { DecisionLog } from './components/DecisionLog';
import { getScene, getAdvice, postDecision } from './api';
import { DEFAULT_START, DEFAULT_END } from './config';

export function App() {
  const [startPoint, setStartPoint] = useState(DEFAULT_START);
  const [endPoint, setEndPoint] = useState(DEFAULT_END);
  const [startName, setStartName] = useState('Bouvet Island Staging');
  const [destinationName, setDestinationName] = useState('Atka Bay (Neumayer III)');
  const [missionName, setMissionName] = useState('Antarctic Resupply Voyage — Neumayer III Station');
  const [clickTarget, setClickTarget] = useState('start');
  const [hintText, setHintText] = useState('Click map or type coordinates above, then press Plan route.');

  const [scene, setScene] = useState(null);
  const [isSceneMock, setIsSceneMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adviceData, setAdviceData] = useState(null);
  const [isAdviceMock, setIsAdviceMock] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [apiKeyVersion, setApiKeyVersion] = useState(0);

  const hasApiKey = Boolean(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('GOOGLE_MAPS_API_KEY'))
  );

  useEffect(() => {
    let mounted = true;
    getScene().then(({ data, isMock }) => {
      if (mounted) {
        setScene(data);
        setIsSceneMock(isMock);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleMapClick = useCallback((coords) => {
    if (clickTarget === 'start') {
      setStartPoint(coords);
      setClickTarget('end');
      setHintText('Departure set on map. Click destination or edit inputs.');
    } else {
      setEndPoint(coords);
      setClickTarget('start');
      setHintText('Waypoints set. Press Plan route to analyse.');
    }
  }, [clickTarget]);

  const handleApplyPreset = (preset) => {
    setStartPoint(preset.start);
    setEndPoint(preset.dest);
    setStartName(preset.startName);
    setDestinationName(preset.destName);
    setMissionName(preset.mission);
    setHintText(`Applied preset: ${preset.name}. Press Plan route to analyse.`);
  };

  const handlePlanRoute = async () => {
    if (!startPoint || !endPoint) return;
    setIsLoading(true);
    try {
      const { data, isMock } = await getAdvice(startPoint, endPoint);
      setAdviceData(data);
      setIsAdviceMock(isMock);
      setSelectedRoute(null);
    } catch (err) {
      console.error('Plan route failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStartPoint(DEFAULT_START);
    setEndPoint(DEFAULT_END);
    setStartName('Bouvet Island Staging');
    setDestinationName('Atka Bay (Neumayer III)');
    setMissionName('Antarctic Resupply Voyage — Neumayer III Station');
    setClickTarget('start');
    setAdviceData(null);
    setSelectedRoute(null);
    setHintText('Reset to defaults. Click map or type coordinates.');
  };

  const handleSaveApiKey = (key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('GOOGLE_MAPS_API_KEY', key);
    }
    setApiKeyVersion((v) => v + 1);
  };

  const handleLogDecision = async (payload) => {
    const res = await postDecision(payload);
    setDecisions((prev) => [{ ...payload, id: res.id || `local_${Date.now()}` }, ...prev]);
    return res;
  };

  return (
    <div className="app-container">
      <Header hasApiKey={hasApiKey} onSaveApiKey={handleSaveApiKey} />

      <main className="app-content">
        <MapView
          key={`map-${apiKeyVersion}`}
          scene={scene}
          startPoint={startPoint}
          endPoint={endPoint}
          routes={adviceData?.routes}
          selectedRoute={selectedRoute}
          onMapClick={handleMapClick}
        />

        <section className="panel-column" aria-label="Instrument Panel">
          <VoyagePanel
            startPoint={startPoint}
            endPoint={endPoint}
            mission={adviceData?.mission || missionName}
            startName={startName}
            destinationName={destinationName}
            onUpdateStart={setStartPoint}
            onUpdateEnd={setEndPoint}
            onUpdateStartName={setStartName}
            onUpdateDestName={setDestinationName}
            onApplyPreset={handleApplyPreset}
            isLoading={isLoading}
            hintText={hintText}
            onPlanRoute={handlePlanRoute}
            onReset={handleReset}
          />

          <DataSourceBar meta={scene?.meta} isMock={isSceneMock || isAdviceMock} />

          {adviceData && (
            <>
              <Headline routes={adviceData.routes} isMock={isAdviceMock} />
              <RouteTable
                routes={adviceData.routes}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
              />
              <AdvisorCard
                advice={adviceData.advice}
                confidence={adviceData.confidence}
                evaluation={adviceData}
                recommendedRoute={adviceData.recommended_route_id || 'safest'}
                selectedRoute={selectedRoute}
                startPoint={startPoint}
                endPoint={endPoint}
                onLogDecision={handleLogDecision}
              />
            </>
          )}

          <DecisionLog decisions={decisions} />
        </section>
      </main>
    </div>
  );
}
