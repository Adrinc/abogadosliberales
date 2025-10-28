import React from 'react';

/**
 * Panel de debugging temporal para diagnóstico de problemas
 * Muestra información en tiempo real sobre el estado del componente
 */
const DebugPanel = ({ 
  hasData, 
  leadId, 
  transactionId, 
  paymentMethod, 
  status,
  isLoading,
  error,
  customerData,
  paymentData,
  retryCount,
  actualPaymentMethod,
  webhookResponse, // Nuevo: Response completo del webhook
  ticketQRUrl,     // Nuevo: URL del QR extraída
  ticketId         // Nuevo: ID del ticket extraído
}) => {
  
  // Intentar parsear el webhook response si es string
  let parsedWebhookResponse = webhookResponse;
  if (typeof webhookResponse === 'string') {
    try {
      parsedWebhookResponse = JSON.parse(webhookResponse);
    } catch (e) {
      // Ya está parseado o es inválido
    }
  }
  return (
    <div style={{
      position: 'fixed',
      top: '80px', // Debajo del navbar
      right: '10px',
      background: '#000',
      color: '#0f0',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '11px',
      maxWidth: '420px',
      maxHeight: '90vh',
      overflowY: 'auto',
      zIndex: 999999, // Muy alto para estar siempre visible
      border: '2px solid #0f0',
      boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)'
    }}>
      <div style={{ 
        marginBottom: '12px', 
        fontWeight: 'bold', 
        color: '#ff0',
        fontSize: '14px',
        textAlign: 'center',
        borderBottom: '1px solid #0f0',
        paddingBottom: '8px'
      }}>
        🐛 DEBUG PANEL
      </div>

      {/* Props Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          📋 PROPS FROM URL/PAGE:
        </div>
        <div><strong>hasData:</strong> <span style={{ color: hasData ? '#0f0' : '#f00' }}>{String(hasData)}</span></div>
        <div><strong>leadId:</strong> {leadId || 'null'} <span style={{ color: '#888' }}>({typeof leadId})</span></div>
        <div><strong>transactionId:</strong> {transactionId || 'null'}</div>
        <div><strong>paymentMethod:</strong> <span style={{ color: paymentMethod === 'unknown' ? '#ff0' : '#0f0' }}>{paymentMethod}</span></div>
        <div><strong>status:</strong> <span style={{ color: status === 'confirmed' ? '#0f0' : '#ff0' }}>{status}</span></div>
      </div>

      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />

      {/* Component State Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          ⚙️ COMPONENT STATE:
        </div>
        <div><strong>isLoading:</strong> <span style={{ color: isLoading ? '#ff0' : '#0f0' }}>{String(isLoading)}</span></div>
        <div><strong>error:</strong> <span style={{ color: error ? '#f00' : '#0f0' }}>{error || 'null'}</span></div>
        <div><strong>retryCount:</strong> {retryCount}</div>
      </div>

      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />

      {/* Data Loaded Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          💾 DATA LOADED:
        </div>
        <div>
          <strong>customerData:</strong> {customerData ? '✅ Loaded' : '❌ Null'}
          {customerData && (
            <div style={{ marginLeft: '15px', fontSize: '10px', color: '#888' }}>
              <div>• ID: {customerData.customer_id}</div>
              <div>• Name: {customerData.first_name} {customerData.last_name}</div>
              <div>• Email: {customerData.email}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>paymentData:</strong> {paymentData ? '✅ Loaded' : '❌ Null'}
          {paymentData && (
            <div style={{ marginLeft: '15px', fontSize: '10px', color: '#888' }}>
              <div>• Payment ID: {paymentData.event_payment_id}</div>
              <div>• Amount: ${paymentData.amount} {paymentData.currency}</div>
              <div>• Method (DB): <span style={{ color: paymentData.payment_method ? '#0f0' : '#f00' }}>{paymentData.payment_method || 'NULL'}</span></div>
              <div>• PayPal TX: {paymentData.paypal_transaction_id || 'null'}</div>
              <div>• Stripe TX: {paymentData.stripe_transaction_id || paymentData.other_transaction_id || 'null'}</div>
              <div>• Transfer Ref: {paymentData.transfer_reference_number || 'null'}</div>
              <div>• Response: {paymentData.response ? '✅ Exists' : '❌ Null'}</div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />

      {/* Computed Values Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          🎯 COMPUTED VALUES:
        </div>
        <div>
          <strong>actualPaymentMethod:</strong> {' '}
          <span style={{ 
            color: actualPaymentMethod === 'unknown' ? '#f00' : '#0f0',
            fontWeight: 'bold'
          }}>
            {actualPaymentMethod || 'NOT COMPUTED YET'}
          </span>
        </div>
        {actualPaymentMethod && actualPaymentMethod !== 'unknown' && (
          <div style={{ fontSize: '10px', color: '#0f0', marginLeft: '15px' }}>
            ✓ Payment method successfully resolved
          </div>
        )}
        {actualPaymentMethod === 'unknown' && (
          <div style={{ fontSize: '10px', color: '#f00', marginLeft: '15px' }}>
            ⚠ Could not determine payment method
          </div>
        )}
      </div>

      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />

      {/* Webhook Response Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          🎫 WEBHOOK RESPONSE ANALYSIS:
        </div>
        
        {!webhookResponse || Object.keys(webhookResponse).length === 0 ? (
          <div style={{ color: '#f00', fontSize: '11px' }}>
            ❌ No webhook response found
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '3px' }}>
                Response Type: <span style={{ color: '#0f0' }}>{typeof webhookResponse}</span>
              </div>
              
              {/* Success flag */}
              {parsedWebhookResponse?.success !== undefined && (
                <div style={{ fontSize: '10px' }}>
                  <strong>success:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.success ? '#0f0' : '#f00' }}>
                    {String(parsedWebhookResponse.success)}
                  </span>
                </div>
              )}
              
              {/* Message */}
              {parsedWebhookResponse?.message && (
                <div style={{ fontSize: '10px', marginTop: '3px' }}>
                  <strong>message:</strong> {parsedWebhookResponse.message}
                </div>
              )}
            </div>

            {/* Data object analysis */}
            {parsedWebhookResponse?.data ? (
              <div style={{ 
                background: 'rgba(0, 255, 0, 0.05)', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid rgba(0, 255, 0, 0.3)'
              }}>
                <div style={{ color: '#0f0', fontWeight: 'bold', marginBottom: '5px', fontSize: '11px' }}>
                  ✅ DATA OBJECT FOUND:
                </div>
                
                {/* Payment ID */}
                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                  <strong>payment_id:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.data.payment_id ? '#0f0' : '#f00' }}>
                    {parsedWebhookResponse.data.payment_id || 'missing'}
                  </span>
                </div>

                {/* Payment Status */}
                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                  <strong>payment_status:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.data.payment_status ? '#0f0' : '#f00' }}>
                    {parsedWebhookResponse.data.payment_status || 'missing'}
                  </span>
                </div>

                {/* Transaction ID */}
                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                  <strong>paypal_transaction_id:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.data.paypal_transaction_id ? '#0f0' : '#888' }}>
                    {parsedWebhookResponse.data.paypal_transaction_id || 'null'}
                  </span>
                </div>

                {/* QR Code */}
                <div style={{ fontSize: '10px', marginLeft: '10px', marginTop: '5px' }}>
                  <strong>qr_code:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.data.qr_code ? '#0f0' : '#f00' }}>
                    {parsedWebhookResponse.data.qr_code || 'missing'}
                  </span>
                </div>

                {/* QR Image URL - CRÍTICO */}
                <div style={{ 
                  fontSize: '10px', 
                  marginLeft: '10px',
                  padding: '4px',
                  background: parsedWebhookResponse.data.qr_image_url ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                  marginTop: '3px',
                  borderRadius: '3px'
                }}>
                  <strong>qr_image_url:</strong> {' '}
                  {parsedWebhookResponse.data.qr_image_url ? (
                    <>
                      <span style={{ color: '#0f0' }}>✅ FOUND</span>
                      <div style={{ 
                        fontSize: '9px', 
                        color: '#888', 
                        marginTop: '2px',
                        wordBreak: 'break-all'
                      }}>
                        {parsedWebhookResponse.data.qr_image_url}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: '#f00' }}>❌ MISSING</span>
                  )}
                </div>

                {/* Customer Info */}
                <div style={{ fontSize: '10px', marginLeft: '10px', marginTop: '5px' }}>
                  <strong>customer_name:</strong> {parsedWebhookResponse.data.customer_name || 'null'}
                </div>
                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                  <strong>customer_email:</strong> {parsedWebhookResponse.data.customer_email || 'null'}
                </div>

                {/* Event Info */}
                <div style={{ fontSize: '10px', marginLeft: '10px', marginTop: '5px' }}>
                  <strong>event_name:</strong> {parsedWebhookResponse.data.event_name || 'null'}
                </div>

                {/* Ticket ID */}
                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                  <strong>ticket_id:</strong> {' '}
                  <span style={{ color: parsedWebhookResponse.data.ticket_id ? '#0f0' : '#888' }}>
                    {parsedWebhookResponse.data.ticket_id || 'null'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(255, 0, 0, 0.1)', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                color: '#f00',
                fontSize: '10px'
              }}>
                ❌ NO "data" OBJECT FOUND IN RESPONSE
                <div style={{ fontSize: '9px', color: '#888', marginTop: '3px' }}>
                  Expected structure: {`{ success: true, data: { ... } }`}
                </div>
              </div>
            )}

            {/* Extracted Values */}
            <div style={{ marginTop: '8px', fontSize: '10px' }}>
              <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '3px' }}>
                Extracted Values:
              </div>
              <div style={{ marginLeft: '10px' }}>
                <strong>ticketQRUrl:</strong> {' '}
                <span style={{ color: ticketQRUrl ? '#0f0' : '#f00' }}>
                  {ticketQRUrl ? '✅ Extracted' : '❌ Not extracted'}
                </span>
              </div>
              <div style={{ marginLeft: '10px' }}>
                <strong>ticketId:</strong> {' '}
                <span style={{ color: ticketId ? '#0f0' : '#888' }}>
                  {ticketId || 'null'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <hr style={{ margin: '10px 0', borderColor: '#0f0' }} />

      {/* Instructions */}
      <div style={{ 
        fontSize: '9px', 
        color: '#888', 
        marginTop: '10px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px'
      }}>
        💡 Este panel muestra información en tiempo real para diagnosticar problemas.
        Verifica que todos los valores sean correctos.
      </div>
    </div>
  );
};

export default DebugPanel;
