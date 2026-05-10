import React from 'react';
import './index.css';
import { useNavsight } from './hooks/useNavsight';
import { useStore } from './store';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import MetricStrip from './components/MetricStrip';
import RadarPage from './pages/RadarPage';
import VesselsPage from './pages/VesselsPage';
import ThreatsPage from './pages/ThreatsPage';
import CrewPage from './pages/CrewPage';
import AnalyticsPage from './pages/AnalyticsPage';

const PAGES = {
  radar: RadarPage,
  vessels: VesselsPage,
  threats: ThreatsPage,
  crew: CrewPage,
  analytics: AnalyticsPage,
};

export default function App() {
  useNavsight();
  const { activeTab } = useStore();
  const Page = PAGES[activeTab] || RadarPage;

  return (
    <div style={styles.root}>
      <Header />
      <NavTabs />
      <MetricStrip />
      <div style={styles.content}>
        <Page />
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--navy)',
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    minHeight: 0,
  },
};
