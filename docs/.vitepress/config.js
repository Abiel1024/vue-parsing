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
                text: 'Github',
                link: 'https://github.com/Abiel1024/vue-parsing'
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
                text: 'npm run dev',
                link: '/projectConfig'
            },
            {
                text: 'reactive',
                link: '/reactive'
            }
        ]
    },
    sidebar: 'auto',
    displayAllHeaders: true,
}

