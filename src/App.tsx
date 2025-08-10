import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import AppRouter from './router';
import { useAppStore } from './stores';
import { storageService } from './services/storageService';
import { zhipuService } from './services/zhipuService';
import './App.css';

function App() {
  const { config, updateConfig } = useAppStore();

  // 初始化应用
  useEffect(() => {
    const initApp = async () => {
      try {
        // 初始化存储服务
        await storageService.initDatabase();

        // 从环境变量加载API Key
        const envApiKey = import.meta.env.VITE_ZHIPU_API_KEY;
        
        // 加载配置
        const savedConfig = await storageService.getConfig();
        let finalConfig = savedConfig;
        
        if (savedConfig) {
          // 如果环境变量中有API Key，优先使用环境变量的值
          if (envApiKey && envApiKey !== savedConfig.zhipu?.apiKey) {
            finalConfig = {
              ...savedConfig,
              zhipu: {
                ...savedConfig.zhipu,
                apiKey: envApiKey
              }
            };
            // 保存更新后的配置
            await storageService.saveConfig(finalConfig);
          }
          updateConfig(finalConfig);

          // 初始化智谱AI配置
          if (finalConfig.zhipu) {
            zhipuService.setConfig(finalConfig.zhipu);
          }
        } else if (envApiKey) {
          // 如果没有保存的配置但有环境变量API Key，创建默认配置
          const defaultConfig = {
            theme: 'light' as const,
            language: 'zh-CN' as const,
            autoSave: true,
            autoSaveInterval: 30000,
            zhipu: {
              apiKey: envApiKey,
              model: 'glm-4',
              timeout: 30000
            }
          };
          await storageService.saveConfig(defaultConfig);
          updateConfig(defaultConfig);
          zhipuService.setConfig(defaultConfig.zhipu);
        }

        console.log('应用初始化完成');
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    };

    initApp();
  }, [updateConfig]);

  return (
    <ConfigProvider
      locale={config.language === 'zh-CN' ? zhCN : undefined}
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
