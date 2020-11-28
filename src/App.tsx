import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import ActionBar from './ActionBar';
import { ReactQueryDevtools } from 'react-query-devtools'
import NodeWindowManagerContainer from './NodeManager/containers/NodeWindowManagerContainer';

function App() {

  const [loading, setLoading] = useState(false)
  
  return (
    <>
      <BrowserRouter>
        <ActionBar 
          actionMap={{}}
          loading={loading}
        />
        <Routes>
          <Route element={<Navigate to="nodes" />} />
          <Route path="/nodes" element={<NodeWindowManagerContainer setLoading={setLoading} />}/>
          <Route path="/nodes/:nodeId" element={<NodeWindowManagerContainer setLoading={setLoading} />}/>
          <Route path="/nodes/:nodeId/anchor/:anchorId" element={<NodeWindowManagerContainer setLoading={setLoading} />}/>
        </Routes>
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
} 


export default App;
