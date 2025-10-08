import React from "react";
import { useShareHandler } from "../hooks/useShareHandler";

/**
 * ShareReceiver Component - Shows shared content in a modal/overlay
 */
export default function ShareReceiver({ onBookAdd }) {
  const { sharedData, clearSharedData } = useShareHandler();

  if (!sharedData) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2>Add Shared Book</h2>

        {sharedData.extractedBook ? (
          <div>
            <p>✅ Found book information:</p>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                padding: "12px",
                margin: "12px 0",
              }}
            >
              <strong>{sharedData.extractedBook.title}</strong>
              <br />
              <span style={{ color: "#666" }}>
                {sharedData.extractedBook.author}
              </span>
            </div>
            <button
              onClick={() => {
                onBookAdd(sharedData.extractedBook);
                clearSharedData();
              }}
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "12px 24px",
                marginRight: "8px",
              }}
            >
              Add This Book
            </button>
          </div>
        ) : (
          <div>
            <p>📝 Shared content received:</p>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                padding: "12px",
                margin: "12px 0",
                backgroundColor: "#f8f9fa",
                wordBreak: "break-all",
              }}
            >
              {sharedData.fallbackText || sharedData.originalData.url}
            </div>
            <p style={{ fontSize: "14px", color: "#666" }}>
              We couldn't automatically extract book info. You can manually add
              this book using the shared information.
            </p>
          </div>
        )}

        <button
          onClick={clearSharedData}
          style={{
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "12px 24px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
