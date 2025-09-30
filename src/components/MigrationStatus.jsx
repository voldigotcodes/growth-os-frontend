import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext.jsx';
import { triggerManualMigration, isMigrationNeeded } from '../utils/migrateLocalToFirestore.js';
import GlassCard from './GlassCard.jsx';
import PrimaryButton from './PrimaryButton.jsx';

export default function MigrationStatus() {
  const { currentUser, migrationStatus, isMigrationComplete, isMigrationInProgress } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isManualMigrating, setIsManualMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  // Check if migration is needed when user is authenticated
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    if (currentUser && !isMigrationInProgress()) {
      setNeedsMigration(isMigrationNeeded());
    }
  }, [currentUser, isMigrationInProgress]);

  const handleManualMigration = async () => {
    if (!currentUser || isManualMigrating) return;

    setIsManualMigrating(true);
    try {
      const result = await triggerManualMigration(currentUser.uid);
      setMigrationResult(result);

      if (result.success) {
        setNeedsMigration(false);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: error.message,
        error
      });
    } finally {
      setIsManualMigrating(false);
    }
  };

  // Don't show if user is not authenticated
  if (!currentUser) {
    return null;
  }

  // Don't show if migration is complete and no issues
  if (isMigrationComplete() && !needsMigration && !migrationResult) {
    return null;
  }

  const getStatusColor = () => {
    if (isMigrationInProgress() || isManualMigrating) return 'text-blue-400';
    if (isMigrationComplete() && !needsMigration) return 'text-green-400';
    if (needsMigration) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (isMigrationInProgress() || isManualMigrating) return 'Migrating data...';
    if (isMigrationComplete() && !needsMigration) return 'Migration complete';
    if (needsMigration) return 'Data migration needed';
    if (migrationStatus === 'failed') return 'Migration failed';
    return 'Unknown status';
  };

  return (
    <GlassCard className="p-4 mb-4 border-l-4 border-l-blue-400">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${getStatusColor()}`}>
            🔄 Data Migration Status
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {getStatusText()}
          </p>

          {migrationResult && (
            <div className={`mt-2 p-2 rounded text-xs ${
              migrationResult.success
                ? 'bg-green-900/20 text-green-300'
                : 'bg-red-900/20 text-red-300'
            }`}>
              {migrationResult.message}
              {migrationResult.migratedKeys && migrationResult.migratedKeys.length > 0 && (
                <div className="mt-1">
                  Migrated: {migrationResult.migratedKeys.join(', ')}
                </div>
              )}
            </div>
          )}

          {showDetails && (
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p><strong>What is this?</strong></p>
              <p>We're upgrading your data storage from browser localStorage to secure cloud storage (Firebase Firestore).</p>

              <p className="mt-2"><strong>Benefits:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Your preferences sync across devices</li>
                <li>Data is backed up and secure</li>
                <li>Better performance and reliability</li>
                <li>Real-time updates</li>
              </ul>

              {needsMigration && (
                <>
                  <p className="mt-2"><strong>What data will be migrated?</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>User preferences and settings</li>
                    <li>Theme and background choices</li>
                    <li>Onboarding completion status</li>
                    <li>Debug settings (kept locally)</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>

          {needsMigration && !isMigrationInProgress() && (
            <PrimaryButton
              onClick={handleManualMigration}
              disabled={isManualMigrating}
              className="text-xs px-3 py-1"
            >
              {isManualMigrating ? 'Migrating...' : 'Migrate Now'}
            </PrimaryButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}