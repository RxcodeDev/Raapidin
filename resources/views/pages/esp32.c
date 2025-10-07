// ============================================================================
// ESP32 WhatsApp Notificador v2.0
// ARCHIVO ÚNICO PARA ARDUINO IDE
// ============================================================================

#include <WiFi.h>
#include <HTTPClient.h>

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
namespace Config {
  namespace WiFi {
    constexpr const char* SSID = "dev";
    constexpr const char* PASSWORD = "12345678";
    constexpr uint8_t MAX_CONNECT_ATTEMPTS = 20;
    constexpr uint16_t CONNECT_TIMEOUT_MS = 500;
  }
  
  namespace API {
    constexpr const char* BASE_URL = "https://api.callmebot.com/whatsapp.php";
    constexpr const char* API_KEY = "6106457";
    constexpr const char* PHONE_NUMBER = "5213331786030";
    constexpr uint16_t HTTP_TIMEOUT_MS = 15000;
  }
  
  namespace Pins {
    constexpr uint8_t INPUT_BUTTON = 4;
    constexpr uint8_t LED_ERROR = 15;
    constexpr uint8_t BUZZER = 16;
  }
  
  namespace Timing {
    constexpr uint16_t DEBOUNCE_DELAY_MS = 1000;
    constexpr uint16_t LOOP_DELAY_MS = 50;
    constexpr uint16_t ERROR_DISPLAY_MS = 3000;
  }
}

// ============================================================================
// ENUMERACIONES Y TIPOS
// ============================================================================
enum class NotificationResult {
  SUCCESS,
  WIFI_ERROR,
  HTTP_ERROR,
  API_ERROR
};

// ============================================================================
// INTERFACES
// ============================================================================
class INotificationService {
public:
  virtual ~INotificationService() = default;
  virtual NotificationResult sendMessage(const String& message) = 0;
  virtual bool isConnected() const = 0;
};

class IFeedbackController {
public:
  virtual ~IFeedbackController() = default;
  virtual void indicateSuccess() = 0;
  virtual void indicateError() = 0;
  virtual void indicateWiFiConnected() = 0;
  virtual void initialize() = 0;
};

// ============================================================================
// UTILIDADES
// ============================================================================
class URLEncoder {
public:
  static String encode(const String& str) {
    String encoded;
    encoded.reserve(str.length() * 3);
    
    for (size_t i = 0; i < str.length(); i++) {
      char c = str.charAt(i);
      
      if (c == ' ') {
        encoded += '+';
      } else if (isAlphaNumeric(c)) {
        encoded += c;
      } else {
        encoded += encodeChar(c);
      }
    }
    
    return encoded;
  }

private:
  static bool isAlphaNumeric(char c) {
    return (c >= 'a' && c <= 'z') || 
           (c >= 'A' && c <= 'Z') || 
           (c >= '0' && c <= '9');
  }
  
  static String encodeChar(char c) {
    char hex[4];
    sprintf(hex, "%%%02X", (unsigned char)c);
    return String(hex);
  }
};

// ============================================================================
// CONTROLADOR DE FEEDBACK
// ============================================================================
class FeedbackController : public IFeedbackController {
public:
  FeedbackController() 
    : pinLedError(Config::Pins::LED_ERROR),
      pinBuzzer(Config::Pins::BUZZER) {}
  
  void initialize() override {
    pinMode(pinLedError, OUTPUT);
    pinMode(pinBuzzer, OUTPUT);
    turnOffAll();
  }
  
  void indicateSuccess() override {
    playSuccessMelody();
  }
  
  void indicateError() override {
    blinkErrorLed();
  }
  
  void indicateWiFiConnected() override {
    playShortBeep();
  }

private:
  const uint8_t pinLedError;
  const uint8_t pinBuzzer;
  
  void turnOffAll() {
    digitalWrite(pinLedError, LOW);
    digitalWrite(pinBuzzer, LOW);
  }
  
  void playSuccessMelody() {
    for (uint8_t i = 0; i < 3; i++) {
      beep(100);
      delay(100);
    }
    beep(500);
  }
  
  void blinkErrorLed() {
    for (uint8_t i = 0; i < 5; i++) {
      digitalWrite(pinLedError, HIGH);
      delay(200);
      digitalWrite(pinLedError, LOW);
      delay(200);
    }
    
    digitalWrite(pinLedError, HIGH);
    delay(2000);
    digitalWrite(pinLedError, LOW);
  }
  
  void playShortBeep() {
    beep(150);
    delay(100);
    beep(150);
  }
  
  void beep(uint16_t durationMs) {
    digitalWrite(pinBuzzer, HIGH);
    delay(durationMs);
    digitalWrite(pinBuzzer, LOW);
  }
};

// ============================================================================
// GESTOR WiFi
// ============================================================================
class WiFiManager {
public:
  bool connect() {
    Serial.print("Conectando a WiFi: ");
    Serial.println(Config::WiFi::SSID);
    
    WiFi.begin(Config::WiFi::SSID, Config::WiFi::PASSWORD);
    
    uint8_t attempts = 0;
    while (!isConnected() && attempts < Config::WiFi::MAX_CONNECT_ATTEMPTS) {
      delay(Config::WiFi::CONNECT_TIMEOUT_MS);
      Serial.print(".");
      attempts++;
    }
    
    Serial.println();
    
    if (isConnected()) {
      logConnectionSuccess();
      return true;
    } else {
      logConnectionFailure();
      return false;
    }
  }
  
  bool isConnected() const {
    return WiFi.status() == WL_CONNECTED;
  }
  
  bool reconnectIfNeeded() {
    if (!isConnected()) {
      Serial.println("⚠ WiFi desconectado, reconectando...");
      return connect();
    }
    return true;
  }

private:
  void logConnectionSuccess() {
    Serial.println("✓ WiFi conectado exitosamente!");
    Serial.print("✓ Dirección IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("✓ Intensidad señal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  
  void logConnectionFailure() {
    Serial.println("✗ Error: No se pudo conectar a WiFi");
  }
};

// ============================================================================
// SERVICIO WHATSAPP
// ============================================================================
class WhatsAppService : public INotificationService {
public:
  WhatsAppService(WiFiManager& wifiMgr) 
    : wifiManager(wifiMgr) {}
  
  NotificationResult sendMessage(const String& message) override {
    Serial.println("\n--- Enviando mensaje WhatsApp ---");
    
    if (!isConnected()) {
      Serial.println("✗ Error: Sin conexión WiFi");
      return NotificationResult::WIFI_ERROR;
    }
    
    HTTPClient http;
    String url = buildRequestURL(message);
    
    Serial.println("Enviando a: " + String(Config::API::PHONE_NUMBER));
    Serial.println("Conectando con CallMeBot API...");
    
    http.begin(url);
    http.setTimeout(Config::API::HTTP_TIMEOUT_MS);
    
    int httpCode = http.GET();
    NotificationResult result = processHTTPResponse(httpCode, http);
    
    http.end();
    Serial.println("--- Fin de envío ---\n");
    
    return result;
  }
  
  bool isConnected() const override {
    return wifiManager.isConnected();
  }

private:
  WiFiManager& wifiManager;
  
  String buildRequestURL(const String& message) {
    String encodedMessage = URLEncoder::encode(message);
    
    String url = String(Config::API::BASE_URL);
    url += "?phone=" + String(Config::API::PHONE_NUMBER);
    url += "&text=" + encodedMessage;
    url += "&apikey=" + String(Config::API::API_KEY);
    
    return url;
  }
  
  NotificationResult processHTTPResponse(int httpCode, HTTPClient& http) {
    Serial.print("Código respuesta HTTP: ");
    Serial.println(httpCode);
    
    if (httpCode <= 0) {
      Serial.println("✗ Error en la petición HTTP");
      Serial.println("Detalles: " + http.errorToString(httpCode));
      return NotificationResult::HTTP_ERROR;
    }
    
    String response = http.getString();
    Serial.println("Respuesta API: " + response);
    
    if (httpCode == 200) {
      Serial.println("✓ Mensaje enviado exitosamente!");
      return NotificationResult::SUCCESS;
    } else {
      Serial.println("⚠ Advertencia: Código HTTP " + String(httpCode));
      return NotificationResult::API_ERROR;
    }
  }
};

// ============================================================================
// MANEJADOR DE BOTÓN
// ============================================================================
class InputButtonHandler {
public:
  InputButtonHandler(uint8_t pin) 
    : inputPin(pin), 
      lastState(HIGH), 
      isProcessing(false) {}
  
  void initialize() {
    pinMode(inputPin, INPUT_PULLUP);
  }
  
  bool isPressed() {
    bool currentState = digitalRead(inputPin);
    
    if (currentState == LOW && lastState == HIGH && !isProcessing) {
      Serial.println("\n>>> Señal detectada en D" + String(inputPin));
      isProcessing = true;
      lastState = currentState;
      return true;
    }
    
    lastState = currentState;
    return false;
  }
  
  void resetProcessing() {
    delay(Config::Timing::DEBOUNCE_DELAY_MS);
    isProcessing = false;
  }

private:
  const uint8_t inputPin;
  bool lastState;
  bool isProcessing;
};

// ============================================================================
// CONSTRUCTOR DE MENSAJES
// ============================================================================
class MessageBuilder {
public:
  static String buildAttendanceMessage() {
    String message = "Hola, dueño de la tienda Don Martín.\n\n";
    message += "El personal ha llegado a su turno a las siguientes horas:\n\n";
    message += "Ricardo — 08:15 AM\n\n";
    message += "Jesús — 08:20 AM\n\n";
    message += "Alma — 08:25 AM";
    return message;
  }
  
  static String buildCustomMessage(const String& title, const String& body) {
    return title + "\n\n" + body;
  }
};

// ============================================================================
// CONTROLADOR DE NOTIFICACIONES
// ============================================================================
class NotificationController {
public:
  NotificationController(
    INotificationService& notifService,
    IFeedbackController& feedbackCtrl,
    WiFiManager& wifiMgr
  ) : notificationService(notifService),
      feedbackController(feedbackCtrl),
      wifiManager(wifiMgr) {}
  
  void handleNotificationRequest() {
    if (!wifiManager.reconnectIfNeeded()) {
      feedbackController.indicateError();
      return;
    }
    
    String message = MessageBuilder::buildAttendanceMessage();
    NotificationResult result = notificationService.sendMessage(message);
    
    handleResult(result);
  }

private:
  INotificationService& notificationService;
  IFeedbackController& feedbackController;
  WiFiManager& wifiManager;
  
  void handleResult(NotificationResult result) {
    switch (result) {
      case NotificationResult::SUCCESS:
        feedbackController.indicateSuccess();
        break;
      
      case NotificationResult::WIFI_ERROR:
      case NotificationResult::HTTP_ERROR:
      case NotificationResult::API_ERROR:
        feedbackController.indicateError();
        break;
    }
  }
};

// ============================================================================
// INSTANCIAS GLOBALES
// ============================================================================
WiFiManager wifiManager;
FeedbackController feedbackController;
WhatsAppService whatsappService(wifiManager);
InputButtonHandler inputButton(Config::Pins::INPUT_BUTTON);
NotificationController notificationController(
  whatsappService, 
  feedbackController, 
  wifiManager
);

// ============================================================================
// SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("ESP32 WhatsApp Notificador v2.0");
  Serial.println("Clean Architecture Edition");
  Serial.println("=================================\n");
  
  feedbackController.initialize();
  inputButton.initialize();
  
  if (wifiManager.connect()) {
    feedbackController.indicateWiFiConnected();
  } else {
    feedbackController.indicateError();
  }
  
  Serial.println("\n✓ Sistema listo!");
  Serial.println("Esperando señal en D4...\n");
}

// ============================================================================
// LOOP
// ============================================================================
void loop() {
  if (inputButton.isPressed()) {
    notificationController.handleNotificationRequest();
    inputButton.resetProcessing();
  }
  
  delay(Config::Timing::LOOP_DELAY_MS);
}