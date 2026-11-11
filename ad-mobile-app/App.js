import React from 'react';
import { StatusBar } from 'react-native';
import { COLORS } from './src/constants/theme';
import { AuthProvider } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
