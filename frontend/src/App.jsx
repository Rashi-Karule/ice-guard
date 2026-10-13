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
  const [clickTarget, setClickTarget] = useState('start');
  const [hintText, setHintText] = useState('Click the map to change departure, or press Plan route.');
  const [scene, setScene] = useState(null);
  const [isSceneMock, setIsSceneMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adviceData, setAdviceData] = useState(null);
  const [isAdviceMock, setIsAdviceMock] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [decisions, setDecisions] = useState([]);

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
      setHintText('Departure set. Click the map to set destination.');
    } else {
      setEndPoint(coords);
      setClickTarget('start');
      setHintText('Destination set. Press Plan route to analyse.');
    }
  }, [clickTarget]);

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
    setClickTarget('start');
    setAdviceData(null);
    setSelectedRoute(null);
    setHintText('Reset to default voyage. Press Plan route to analyse.');
  };

  const handleLogDecision = async (payload) => {
    const res = await postDecision(payload);
    setDecisions((prev) => [{ ...payload, id: res.id || `local_${Date.now()}` }, ...prev]);
    return res;
  };

  return (
    <div className="app-container">
      <Header />
      <main className="app-content">
        <MapView
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
            mission={adviceData?.mission}
            startName={adviceData?.start?.name}
            destinationName={adviceData?.destination?.name}
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
