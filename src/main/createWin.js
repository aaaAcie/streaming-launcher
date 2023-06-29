const { app, BrowserWindow,ipcMain,dialog  } = require('electron')
const { exec, spawn } = require('child_process')
const iconv = require('iconv-lite')
const path = require('path')
const fs = require('fs');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./err.log', 'a');
const os = require('os');
const yaml = require('js-yaml');
// const logFilePath = path.join(__dirname, 'out.log')


// 创建新的标签页
export function createTab(mainWindow, url) {
  let tabWindow = new BrowserWindow({
    parent: mainWindow,
    width: 1920,
    height: 1080
  })

  // 在新窗口中加载页面
  tabWindow.loadURL(url)
}

export function createEXE2(cmdStr, cmdPath) {
  let path2 = path.join(path.resolve('./'), cmdPath)
  let cmdObj = {
    cwd: path2,
    windowsHide: true,
    encoding: 'cp936'
  }
  let workerProcess
  try {
    // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
    workerProcess = exec(cmdStr, cmdObj, (error, stdout, stderr) => {})
    // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
      console.log('stdout: ' + data)
    })
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })
    // 退出之后的输出
    workerProcess.on('close', function (code) {
      console.log('out code：' + code)
    })
  } catch (e) {
    console.log('error..')
  }
  console.log('-------------', workerProcess.pid)
  return workerProcess
}
export function createEXE3(cmdStr, cmdPath, cmdArray,mainWindow) {
  cmdPath = checkPath(cmdPath)
  let path2 = path.join(path.resolve('./'), cmdPath)
  console.log(path2, cmdArray, Date.now())
  // 把子进程的输出重定向到一个文件中
  // let workerProcess = spawn(cmdStr, [], { cwd: path2, windowsHide: true, encoding: 'cp936',stdio: [ 'ignore', out, err ] })
  let workerProcess = spawn(cmdStr, cmdArray, { cwd: path2, windowsHide: true, encoding: 'cp936' })

  workerProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
    mainWindow.webContents.send('sendMsg','success', `${data}`, `${cmdStr}`);
    
  })
  workerProcess.stderr.on('data', (data) => {
    // const data2 = Buffer.from(data).toString('utf8')
    // const blob = new Blob([data])
    mainWindow.webContents.send('sendMsg', 'error', `${data}`, `${cmdStr}`);

    // blob.text().then(console.log);

    // console.log(err.message)
    console.error(`stderr: ${data}`)

  })
  // workerProcess.unref()
  console.log(`cmdStr: ${cmdStr}, pid为${workerProcess.pid}`)
  return workerProcess
}
export const getIp = (str) => {

  const interfaces = os.networkInterfaces();
  let addresses = [];

  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses[0]
}

export const readJson = (path) => {
  return new Promise((resolve, reject) => {
    // 读取本地 JSON 文件
    fs.readFile(path, async(err, data) => {
      if (err) throw err;
      // 解析 JSON 数据
      const jsonData = JSON.parse(data);
      const localIP = getIp()
      
      // 处理数据
      // jsonData.managerPort = await readYml()
      console.log(jsonData);
      const {ueDefaultDir, evrDefaultDir,managerDefaultDir} = getDefaultPath()
      jsonData.ueDefaultDir = ueDefaultDir
      jsonData.evrDefaultDir = evrDefaultDir
      jsonData.managerDefaultDir = managerDefaultDir
      jsonData.LocalIP = localIP
      if (jsonData.MatchmakerAddress.startsWith("192")) {
        // 若json里存的是局域网，则更新，否则不改变初始值。
        jsonData.MatchmakerAddress = localIP
      }
      jsonData.PublicIp = localIP
      // return jsonData
      resolve(jsonData)
    });
    
  })
}
export const readYml = () => {
  return new Promise((resolve, reject) => {
    // 读取yaml文件
    try {
      const config = yaml.load(fs.readFileSync('..\\manager\\config\\application.yml', 'utf8'));
      console.log(config['server']['port']);

      resolve(config['server']['port'])
    } catch (e) {
      console.log(e);
      resolve(83)
    }
  })
}

// 弹出选择指定目录的框 并返回选择的目录
export const openDialog = () => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog({ 
      title: '请选择底座所在文件夹的Windows目录',
      properties: ['openDirectory']
     }).then(async(result) => {
      // 1. 获取指定的绝对路径
      const selectedDir = result.filePaths[0];
      const allPath = await getExePath(selectedDir)
      resolve(allPath)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}


export const killProcess = (pid) => {
  if (pid) {
    try {
      // 向进程发送0信号以检查其是否存在
      process.kill(pid);
      console.log(`进程 ${pid} 已被成功杀死`);
      return 1
    } catch (err) {
      console.error(`无法杀死进程 ${pid}：${err}`);
      return 0
    }
  }else{
    console.error(`没有收到进程 ${pid}：${err}`);

  }
}

export const writeJson = (finalJson,path) => {
  return new Promise((resolve, reject) => {
    console.log('==============writeJson====================');
    // 写本地 JSON 文件
    try {
      fs.writeFileSync(path, JSON.stringify(finalJson, null, '\t'), 'UTF8');
      resolve('success')
    } catch (error) {
      reject(error)
    }
  })
}

// 弹出选择指定目录的框 并返回选择的目录(返回的是相对路径)
export const getDirectory = (name) => {
  return new Promise((resolve, reject) => {
    const currentDir1 = process.cwd()
    console.log('当前目录: ',currentDir1)

    dialog.showOpenDialog({ 
      title: `请选择指定${name}目录`,
      properties: ['openDirectory']
     }).then(result => {
      // 1. 获取指定的绝对路径
      const selectedDir = result.filePaths[0];
      console.log('selectedDir: ',selectedDir)
      // 2. 计算相对路径
      const relativePath = path.relative(currentDir1, selectedDir);
      console.log('relativePath: ',relativePath)

      resolve({selectedDir, relativePath})
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

export const getExeFile = (folderPath,suffix='.exe') => {
  // 读取当前目录下的所有exe文件
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      console.log(folderPath)
      if (err) throw err;
    
      // 过滤出所有以 .exe 结尾的文件名
      const exeFiles = files.filter(file => {
        return path.extname(file) === suffix
      });
      console.log(files,exeFiles,'--------------')
      // return exeFiles[0]
      if (suffix === '.exe') {
        resolve(exeFiles[0])
      }else{
        resolve(exeFiles)
      }
      // // 如果找到唯一的 .exe 文件，则返回该文件名；否则返回空
      // if (exeFiles.length === 1) {
      //   console.log(`唯一的 .exe 文件为：${exeFiles[0]}`);
      // } else {
      //   console.log('未找到唯一的 .exe 文件');
      // }
    });
    
  })
}

// 返回ue和evr的绝对路径
const getDefaultPath = () => {
  const currentDir = process.cwd()
  // 获取上层目录名
  const parentDirname = path.dirname(currentDir);
  // ue路径默认值
  let ueDefaultDir = path.join(parentDirname, 'Windows')
  // evr文件路径默认值
  let evrDefaultDir = path.join(parentDirname, 'Windows/MxWorld/Content/Maps')
  // manager路径默认值
  let managerDefaultDir = path.join(parentDirname, 'manager')
  return {ueDefaultDir, evrDefaultDir,managerDefaultDir}
}

// 根据指定的ue路径，返回所有相关的地址
export const getExePath = (selectedDir='') => {
  return new Promise((resolve, reject) => {
    if(selectedDir.length == 0){
      selectedDir = getDefaultPath().ueDefaultDir
    }
    const currentDir = app.getAppPath();
    const currentDir1 = process.cwd()
    const currentDir2 = __dirname
  
    console.log('currentDir: ',currentDir)
    console.log('process.cwd(): ',currentDir1)
    console.log('__dirname: ',currentDir2)
    // 1. 获取指定的绝对路径
    // const selectedDir = result.filePaths[0];
    console.log('selectedDir: ',selectedDir)
    // 2. 计算相对路径
    const relativePath = path.relative(currentDir1, selectedDir);
    console.log('relativePath: ',relativePath)
  
    // 3. 返回拼接后的路径
    const fullPath = path.join(relativePath, 'MxWorld/Binaries/Win64');
    console.log('fullPath: ',fullPath)
  
    // 4. 通过fullPath寻找exe的文件名
    getExeFile(fullPath).then(exeFile => {
      // 5. 拼接路径
      // const finalPath = path.join(fullPath, exeFile);
      console.log({selectedDir,relativePath,exeFile, fullPath});
      resolve({selectedDir,relativePath,exeFile, fullPath})
    })
    
  })
}

const checkPath = (p) => {

  if(path.isAbsolute(p)){
    const currentDir1 = process.cwd()
    const relativePath = path.relative(currentDir1, p);
    // 转化相对路径
    return relativePath
  }
  return p
}