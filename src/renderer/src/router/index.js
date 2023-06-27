/*
 * @Author: 徐亦快 913587892@qq.com
 * @Date: 2023-05-30 15:59:00
 * @LastEditors: 徐亦快 913587892@qq.com
 * @LastEditTime: 2023-06-26 09:56:29
 * @FilePath: \mx\UE-launcher3\electron-app\src\renderer\src\router\index.js
 * @Description: 
 * 
 */
import { createRouter,createWebHashHistory} from "vue-router"
const routes = [
  {
    path:'/',
    name: 'home',
    component: () => import('../views/home/index.vue'),
    children: [{
      path: 'mangage',
      name: 'mangage',
      component: () => import('../views/mangage/index.vue')
    }]
  }, 
  // {
  //   path:'/mangage',
  //   name: 'mangage',
  //   component: () => import('../views/mangage/index.vue'),
  // }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router