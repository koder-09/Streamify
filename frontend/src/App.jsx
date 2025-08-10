import { Navigate, Route, Routes } from 'react-router';

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import {Toaster} from "react-hot-toast";
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import Layout from './components/Layout.jsx';
import {useThemeStore} from "./store/useThemeStore.js"
const App = () => {

  const {theme}= useThemeStore();
  const {isLoading, authUser}= useAuthUser();

  const isAuthentictaed= Boolean(authUser);
  const isOnboarded= authUser?.isOnboarded;

  if(isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>

      <Routes>

        <Route path="/" element={
          isAuthentictaed && isOnboarded ? 
          (<Layout showSidebar={true}>
            <HomePage/>
          </Layout> ) : 
          (<Navigate to={!isAuthentictaed ? "/login" : "/onboarding"} /> )
        }/>

        <Route path="/signup" element={
          !isAuthentictaed? <SignUpPage/> : <Navigate to={!isOnboarded ? "/onboarding" : "/"} />
        }/>

        <Route path="/login" element={
          !isAuthentictaed ? <LoginPage/> : <Navigate to={!isOnboarded ? "/onboarding" : "/"} />
        }/>

        <Route path="/notifications" element={
          isAuthentictaed && isOnboarded ? 
          (<Layout showSidebar={true}>
            <NotificationsPage/>
          </Layout> ) :  
          <Navigate to={isAuthentictaed ? "/onboarding" : "/login"} />
        }/>

        <Route path="/chat/:id" element={
          isAuthentictaed && isOnboarded ? 
          (<Layout showSidebar={false}>
              <ChatPage />
            </Layout>) : 
            <Navigate to={!isAuthentictaed ? "/login" : "/onboarding"} />
            
        }/>

        <Route path="/call/:id" element={
          isAuthentictaed && isOnboarded ? <CallPage/> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        }/>

        <Route path="/onboarding" element={
          isAuthentictaed ? (!isOnboarded ? <OnboardingPage/> : <Navigate to="/" />) : (<Navigate to="/login" />)
        }/>

      </Routes>

      <Toaster/>
      
    </div>
  )
}

export default App