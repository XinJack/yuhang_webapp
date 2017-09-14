function YuHang(){
	var that = this;

	this.model = {
		name: '余杭智慧建造整体模型',
		ModelID: '1166610876235968',
		model_type: 'normal'
	}
	
	this.selectedModel = {}

	// 加载模型
	this.loadModel = function(model){
		$.get('http://202.121.178.184:4022/YuHang/getViewToken', {
			model_id: model.ModelID,
			model_type: model.model_type
		})
		.then(function(res){
			console.log(res)
			if(res.code === 'success'){
				that.viewToken = res.data.token_value
				var options = new BimfaceSDKLoaderConfig()
				options.viewToken = that.viewToken
				options.configuration = BimfaceConfigrationOption.Debug

				BimfaceSDKLoader.load(options, function(viewData){
					var webAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig()
					webAppConfig.domElement = document.getElementById('modelContainer')
					var app = new Glodon.Bimface.Application.WebApplication3D(webAppConfig)
					app.addView(that.viewToken)
					app.render()
					app.getViewer().render()
					$('.gld-bf-information').remove()

					// 点击事件
					var appEvents = Glodon.Bimface.Application.WebApplication3DEvent;
					app.addEventListener(appEvents.ComponentsSelectionChanged, function(data){
						// 选中单独模型
						if(that.buildings.hasOwnProperty(data.elementId)){
							that.selectedModel = that.buildings[data.elementId]
							$('#container .operationBtn button').first().removeAttr('disabled')
						}
					})

				}, function(err){
					console.log(err)
					alert('无法加载模型，请稍后重试')
				})
			}else{
				alert('无法获取viewToken，请稍后重试')
			}
		}).catch(function(err){
			console.log(err)
			alert('无法获取viewToken，请稍后重试')
		})
	}

	// 按条件获取文件
	this.getDocuments = function(condition, callback) {
		$.get('http://202.121.178.184:4022/YuHang/fileList', condition)
		.then(function(res){
			if(res.code === 'success'){
				var files = res.data.fileList
				if(files.length === 0){
					callback('暂无数据')
				}else{
					callback(undefined, files)
				}
			}else{
				callback('暂无视频资源', [])
			}
		}).catch(function(err){
			console.log(err)
			callback('无法获取文件', [])
		})
	}

	// 在线预览pdf
	this.playPdf = function(targetDom, pdfSrc) {
		PDFObject.embed(pdfSrc, targetDom)
	}

	// 在线播放视频
	this.playMedia = function(targetDom, mediaSrc) {
		var video = videojs(targetDom)
		video.src(mediaSrc)
		video.load()
	}

	// 在线连续播放多个视频
	this.playMultiMedia = function(targetDom, mediaSrcs){
		var index = 0
		var video = videojs(targetDom)
		play()

		video.on('ended', play)

		function play(){
			if(index >= mediaSrcs.length) return
			video.src(mediaSrcs[index])
			video.load()
			video.play()
			index++
		}
	}

	// 根据模块名称播放视频
	this.playVideos = function(module_name, callback){
		console.log(that.model)
		var file_function = that.getFileFunction(module_name)
		that.getDocuments({
			file_functionAnd: file_function,
			name: '',
			file_type: 'mp4'
		}, function(err, files){
			if(err){
				callback(err)
			}else{
				if(files.length === 0){
					callback('暂无视频')
				}else{
					console.log('there')
					var mediaSrcs = []
					files.forEach(function(file){
						mediaSrcs.push('http://202.121.178.184:4022/resource/视频/mp4/' + file.file_name)
					})
					callback(undefined, mediaSrcs)
				}
			}
		})
	}

	// 根据模块名称在线显示pdf
	this.showPdfs = function(module_name, callback){
		var file_function = that.getFileFunction(module_name)
		that.getDocuments({
			file_functionAnd: file_function,
			name: '',
			file_type: 'pdf'
		}, function(err, files){
			if(err) callback(err)
			else{
				var pdfSrcs = []
				files.forEach(function(file){
					pdfSrcs.push({
						name: file.file_name,
						src: 'http://202.121.178.184:4022/resource/文档/pdf/' + file.file_name
					})
				})
				if(pdfSrcs.length === 0){
					callback('暂无文档')
				}else{
					callback(undefined, pdfSrcs)
				}
			}
		})
	}

	// 删除文件
	this.deleteFile = function(file_id, callback){
		$.ajax({
			url: 'http://202.121.178.184:4022/YuHang/deleteFile?file_id=' + file_id,
			method: 'DELETE'
		}).then(function(res){
			if(res.code === 'success'){
				callback()
			}else{
				callback('无法删除文件')
			}
		}).catch(function(err){
			console.log(err)
			callback('无法删除文件')
		})
	}

	this.navItems = {
		'智慧工地': [{name: '模型浏览'},{name: '实时监控'},{name: '数字巡检'},{name: '物料监控'},{name: '人次识别'}],
		'数字设计': [{name: '3D施工'},{name: '碰撞检查'},{name: '净高检查'},{name: '车库优化'},{name: '空洞预留'}],
		'预智施工': [{name: '成本'},{name: '质量'},{name: '进度'},{name: '安全'},{name: '3D布场方案'},{name: '施工模拟'}],
		'数字文库': [{name: '汇总检索'},{name: '节点上传'},{name: '分类归档'},{name: '3D图审'}],
		'智慧管理': [{name: '规划报批'},{name: '图纸审查'},{name: '审计招标'},{name: '合同管理'}],
	}

	this.file_functions = {
		'实时监控': '010000000000000000000000000000',
		'数字巡检': '001000000000000000000000000000',
		'物料监控': '000100000000000000000000000000',
		'人次识别': '00001000000000000000000000000',
		'碰撞检查': '000000100000000000000000000000',
		'净高检查': '000000010000000000000000000000',
		'车库优化': '000000001000000000000000000000',
		'空洞预留': '000000000100000000000000000000',
		'成本': 	'000000000010000000000000000000',
		'质量': 	'000000000001000000000000000000',
		'进度': 	'000000000000100000000000000000',
		'安全': 	'000000000000010000000000000000',
		'3D布场方案':'000000000000001000000000000000',
		'施工模拟': '000000000000000100000000000000'
	}

	this.getFileFunction = function(function_name){
		return this.file_functions[function_name]
	}

	this.buildings = {
		'2TLR71wvTDh9lHjE845SfN': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
		'2TLR71wvTDh9lHjE845SdH': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
		'0MshBdixfDGeeSAeMPPwgO': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrze': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrnF': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'2TLR71wvTDh9lHjE845ShD': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
		'0MshBdixfDGeeSAeMPPwYE': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrw9': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrqm': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'2TLR71wvTDh9lHjE845Sj3': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
		'2TLR71wvTDh9lHjE845SlQ': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
		'0MshBdixfDGeeSAeMPPwap': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'0MshBdixfDGeeSAeMPPwWB': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrX6': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'2P9rfPYRn7o9meMjS2koFF': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZrhK': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'3MGDrvKff38haLFSbGZs8K': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'0MshBdixfDGeeSAeMPPwcq': {
			name: '160户型',
			ModelID: '1160978901754048',
			model_type: 'normal'
		},
		'2TLR71wvTDh9lHjE845Sme': {
			name: '80户型',
			ModelID: '1160977558913216',
			model_type: 'normal'
		},
	}
}