import React from 'react';
import { useShareHandler } from '../hooks/useShareHandler';
import { db } from '../../utils/db';

/**
 * ShareReceiver Component - Shows shared content in a modal/overlay
 */
export default function ShareReceiver({ onBookAdd }) {
  const { sharedData, clearSharedData } = useShareHandler();
  const [isDuplicate, setIsDuplicate] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState(null); // 'success' | 'error' | null
  const [importError, setImportError] = React.useState('');

  React.useEffect(() => {
    async function checkDuplicate() {
      setChecking(true);
      setIsDuplicate(false);
      setImportStatus(null);
      setImportError('');
      if (sharedData && sharedData.extractedBook) {
        const { title, author } = sharedData.extractedBook;
        if (title && author) {
          const match = await db.books.where({ title, author }).first();
          if (match) setIsDuplicate(true);
        }
      }
      setChecking(false);
    }
    checkDuplicate();
  }, [sharedData]);

  if (!sharedData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h2>Add Shared Book</h2>
        {importStatus === 'success' ? (
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <p
              style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '18px' }}
            >
              🎉 Book imported successfully!
            </p>
            <button
              onClick={clearSharedData}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                marginTop: '16px',
              }}
            >
              Close
            </button>
          </div>
        ) : importStatus === 'error' ? (
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <p
              style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '18px' }}
            >
              ❌ {importError || 'There was an error importing the book.'}
            </p>
            <button
              onClick={clearSharedData}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                marginTop: '16px',
              }}
            >
              Close
            </button>
          </div>
        ) : checking ? (
          <p>Checking for duplicates...</p>
        ) : sharedData.extractedBook ? (
          <div>
            <p>✅ Found book information:</p>
            <div
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                padding: '12px',
                margin: '12px 0',
              }}
            >
              <strong>{sharedData.extractedBook.title}</strong>
              <br />
              <span style={{ color: '#666' }}>
                {sharedData.extractedBook.author}
              </span>
            </div>
            {isDuplicate ? (
              <p style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                This book is already in your library.
              </p>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await onBookAdd(sharedData.extractedBook);
                    setImportStatus('success');
                  } catch (err) {
                    setImportStatus('error');
                    setImportError(err?.message || 'Unknown error');
                  }
                }}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  marginRight: '8px',
                }}
              >
                Add This Book
              </button>
            )}
          </div>
        ) : (
          <div>
            <p>📝 Shared content received:</p>
            <div
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                padding: '12px',
                margin: '12px 0',
                backgroundColor: '#f8f9fa',
                wordBreak: 'break-all',
              }}
            >
              {sharedData.fallbackText || sharedData.originalData.url}
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>
              We couldn't automatically extract book info. You can manually add
              this book using the shared information.
            </p>
          </div>
        )}

        {importStatus === null && (
          <button
            onClick={clearSharedData}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              marginTop: '16px',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
