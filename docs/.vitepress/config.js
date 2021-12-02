module.exports = {
    title: 'Vue3 源码分析',
    description: 'Just do it',
    themeConfig: {
        algolia: {
            appId: '8J64VVRP8K',
            apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
            indexName: 'vitepress'
        },
        nav: [
            {
                text: 'Config Reference',
                link: '/config/basics',
                activeMatch: '^/config/'
            },
            {
                text: 'Release Notes',
                link: 'https://github.com/vuejs/vitepress/releases'
            }
        ],
        sidebar: [
            {
                text: '前言',
                link: '/'
            },
            {
                text: '初探vue项目',
                link: '/getStart'
            },
            {
                text: '项目配置',
                link: '/projectConfig'
            }
        ]
    },
    sidebar: 'auto',
    displayAllHeaders: true,
}

