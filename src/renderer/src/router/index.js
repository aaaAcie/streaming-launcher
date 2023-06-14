/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 15:59:00
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-08 11:42:41
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\router\index.js
 * @Description: 
 * 
 */
/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-08 11:13:25
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-05-08 15:07:09
 * @FilePath: \WebServers424\vite-project\src\router\index.js
 * @Description: 
 * 
 */
/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-02-21 13:23:10
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-03-23 11:28:22
 * @FilePath: \WebServers424\streaming demo\src\router\index.js
 * @Description: 
 * 
 */
import { createRouter,createWebHashHistory} from "vue-router"
const routes = [
  {
    path:'/',
    name: 'home',
    component: () => import('../views/home/index.vue'),
  },  {
    path:'/mangage',
    name: 'mangage',
    component: () => import('../views/mangage/index.vue'),
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router