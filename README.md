# AkemTech POS & Billing 🇨🇲
> **Système Intégré de Caisse Tactile, Facturation & Gestion d'Entreprise pour le Cameroun**

AkemTech POS & Billing est une plateforme complète et moderne conçue spécifiquement pour le commerce de détail, les supermarchés, les quincailleries, les dépôts de boissons et les distributeurs au Cameroun et en zone CEMAC (FCFA / XAF).

---

## 🌟 Fonctionnalités Principales

### 1. 🖨️ Moteur d'Impression Thermique Universel & Auto-Détection
- **Auto-identification intelligente du matériel** :
  - **Sur Ordinateur (Windows / macOS / Linux)** : Détection automatique du spouleur système d'exploitation, ports USB et ports Série (RS232/Serial) avec communication directe WebUSB & Web Serial.
  - **Sur Smartphone & Tablette (Android / iOS / iPadOS)** : Détection Bluetooth ESC/POS (imprimantes 58mm & 80mm portables type MPT-II, POS-5802, Goojprt, Zjiang) et AirPrint / Android Print Service.
  - **Sur Réseau Local (Wi-Fi / Ethernet)** : Envoi direct via socket TCP raw (port 9100).
- **Tickets de Caisse Thermiques Professionnels** :
  - Design réaliste avec effet de découpe dentelée (*tear edges*).
  - Code QR fiscal conforme DGI Cameroun avec vérification cryptographique (NIU, RCCM, N° Facture, Horodatage).
  - Détail TVA Cameroun (19,25%), ventilations paiements (Espèces, MTN MoMo, Orange Money, Afriland First Bank).
  - Découpe papier automatique et impulsion ouverture tiroir-caisse (*cash drawer kick*).

### 2. ⚡ Caisse Tactile Rapide (POS Terminal)
- **Sélection fluide de tous les articles du catalogue** avec recherche instantanée par nom, SKU, marque ou catégorie.
- **Support des Lecteurs Code-barres & QR Codes** :
  - Douchette laser physique (USB / Bluetooth HID) avec détection globale sans champ requis.
  - Scanner caméra temps réel (caméra smartphone ou webcam d'ordinateur) avec retour sonore synthétisé Web Audio API.
- **Gestion des Paniers & Ventes** :
  - Mise en attente / rappel de tickets (Park / Resume sale).
  - Ventes multi-moyens de paiement (MTN MoMo, Orange Money, Espèces avec calculatrice de monnaie, Virement bancaire, Crédit client).
  - Clôture et ouverture de session de caisse avec rapport X et rapport Z.

### 3. 📄 Facturation & Devis Conformes
- Création rapide de Factures Proforma, Devis, Factures Définitives et Bons de Livraison.
- Sélecteur de produits synchronisé avec le stock et prix de vente automatique.
- Suivi des règlements partiels et relances clients via WhatsApp en un clic.

### 4. 📦 Gestion des Stocks Multi-Agences
- Gestion centralisée des entrepôts et points de vente (Douala, Yaoundé, Bafoussam, Bamenda).
- Alertes stock critique et inventaire de contrôle.
- Transferts inter-agences sécurisés avec suivi de traçabilité.

### 5. 💰 Trésorerie & Comptabilité OHADA
- Rapprochement multi-comptes : MTN MoMo Merchant, Orange Money Marchand, Caisse Principale, Afriland First Bank.
- Compte de résultat et export Grand Livre conforme SYSCOHADA révisé.

---

## 🚀 Installation & Démarrage Rapide

### Prérequis
- Node.js 18+ ou 20+
- npm ou bun

### Lancement
```bash
# 1. Cloner le dépôt
git clone https://github.com/VOTRE_UTILISATEUR/akemtech-pos-billing.git
cd akemtech-pos-billing

# 2. Installer les dépendances
npm install

# 3. Démarrer en mode développement
npm run dev

# 4. Compiler pour la production
npm run build
npm start
```

---

## 🛠️ Stack Technique
- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Serveur** : Express.js, TypeScript (tsx), Vite
- **Matériel POS** : Web Serial API, WebUSB API, Web Bluetooth API, Web Audio API, Canvas QR Generator
- **Persistance** : LocalStorage avec synchronisation hors-ligne & support Cloud

---

## 📞 Support & Contact
- **Société** : AkemTech Solutions Cameroun
- **Email** : contact@akemtech.cm
- **Adresse** : Boulevard de la Liberté, Akwa, Douala, Cameroun
