import { SettingOutlined } from '@ant-design/icons'
import { App as AntApp, Button, ConfigProvider, Tabs, theme } from 'antd'
import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SettingsModal } from '@/components/SettingsModal'
import Home from '@/pages/Home'
import Paper from '@/pages/Paper'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const activeKey = location.pathname.startsWith('/paper') ? '/paper' : '/home'

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgBase: '#0f172a' } }}>
      <AntApp style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #1e293b' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#e2e8f0', marginRight: 24 }}>
            MindGenius AI
          </span>
          <Tabs
            activeKey={activeKey}
            onChange={key => navigate(key)}
            items={[
              { key: '/home', label: 'MindMap' },
              { key: '/paper', label: 'Paper' },
            ]}
            style={{ flex: 1 }}
            tabBarStyle={{ marginBottom: 0 }}
          />
          <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} />
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/paper" element={<Paper />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </AntApp>
    </ConfigProvider>
  )
}
