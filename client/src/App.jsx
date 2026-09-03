import { useState } from "react";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { CitizenPage } from "./pages/CitizenPage";
import { LoginPage } from "./pages/LoginPage";
import { clearSession, getStoredSession, storeSession } from "./session";

export default function App() {
  const [session, setSession] = useState(() => getStoredSession(window.localStorage));

  function handleLogin(nextSession) {
    storeSession(window.localStorage, nextSession);
    setSession(nextSession);
  }

  function handleLogout() {
    clearSession(window.localStorage);
    setSession(null);
  }

  return (
    <>
      <Header user={session?.user} onLogout={handleLogout} />
      {!session && <LoginPage onLogin={handleLogin} />}
      {session?.user.role === "citizen" && <CitizenPage user={session.user} />}
      {session?.user.role === "admin" && <AdminPage user={session.user} />}
    </>
  );
}
