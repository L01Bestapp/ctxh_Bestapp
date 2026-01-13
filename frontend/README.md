# UniVolunteer - Mobile Frontend

This is the mobile frontend for the **UniVolunteer** platform, built with **React Native** and **Expo**. It provides a robust interface for both Students and Organizations.

## 📱 Features

### 🔐 Authentication & Security
*   **Secure Login/Signup:** Support for Email/Password and **Google Sign-In**.
*   **Role-Based Access:** Distinct interfaces and permissions for Students and Organizations.
*   **Account Recovery:** Forgot Password flow with OTP verification.
*   **Centralized Configuration:** Secure API URL management via `Config.ts`.

### 🎓 Student Portal
*   **Home Dashboard:** 
    *   View "Upcoming", "Ongoing", and "Ended" activities.
    *   Filter activities by category (e.g., Education, Environment).
    *   Sort by Newest/Oldest.
*   **Activity Details:** 
    *   View comprehensive info: slots available, deadlines, location, and description.
    *   **Register** or **Cancel** enrollment.
*   **My QR:** 
    *   Generate a personal dynamic QR code for attendance verification.
*   **Profile & Stats:** 
    *   Manage personal information and avatar.
    *   View participations history and accumulated Social Work Days.

### 🏢 Organization Portal
*   **Activity Dashboard:** 
    *   Manage all created activities.
    *   **Create Activity:** Form with image upload support (Multipart).
    *   **Update/Close Activity:** Edit details or end events.
*   **Volunteer Request Management:** 
    *   View list of student requests.
    *   **Approve** or **Reject** volunteers based on slots.
*   **QR Scanner:** 
    *   **Check-in Mode:** Scan student QR to mark arrival.
    *   **Check-out Mode:** Scan to mark departure and record hours.
*   **Profile Settings:** 
    *   Update organization details and representative contact info.

## 🛠️ Tech Stack

*   **Framework:** React Native (Expo SDK 50+)
*   **Language:** TypeScript
*   **Routing:** Expo Router
*   **Styling:** StyleSheet (React Native)
*   **Camera:** `expo-camera`
*   **Notifications:** `expo-notifications`
*   **Maps/Location:** (Future integration)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configuration:**
    *   Ideally, create a `.env` file for environment variables (e.g., `EXPO_PUBLIC_API_URL`).
    *   By default, the app uses the configuration in `@/constants/Config.ts`.

3.  **Start the app:**
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator:**
    *   Press `a` for Android Emulator.
    *   Press `i` for iOS Simulator.
    *   Scan the QR code with **Expo Go** on your physical device.

## 📁 Project Structure

*   `app/`: Main application screens and routing (Expo Router).
    *   `(tabs-student)`: Main tabs for Student view.
    *   `(tabs-org)`: Main tabs for Organization view.
    *   `login/`, `signup/`: Authentication screens.
*   `components/`: Reusable UI components (Buttons, Cards, Modals).
*   `constants/`: App constants and Configuration (`Config.ts`).
*   `context/`: React Context providers (e.g., `AuthContext`).
*   `services/`: API service calls.
*   `assets/`: Images, icons, and fonts.

