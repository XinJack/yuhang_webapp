$(document).ready(function(){
	var navMap = {
		'智慧工地': 'placePanel',
		'数字设计': 'designPanel',
		'预智施工': 'workPanel',
		'数字文库': 'docPanel',
		'智慧管理': 'managerPanel'
	}

	var file_functions = {
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

	var fileTypes = {
		'文档': 'doc/docs/pdf/txt/xls/xlsx',
		'图片': 'bmp/jpg/jpeg/png',
		'视频': 'avi/flv/mp4/swf',
		'图纸': 'dwg',
		'模型': 'ifc/rvt'
	}

	// 二级菜单点击事件
	$('div.weui-navbar div.weui-navbar__item').on('click', subNavbarClick)

	// 一级菜单点击事件
	$('div.weui-tabbar a').on('click', navbarClick)

	//默认点击一级菜单
	$('div.weui-tabbar a').first().trigger('click')

	function subNavbarClick(event){
		event.preventDefault()

		var $dom = $(this)
		if($dom.hasClass('weui-bar__item_on')){
			doAction($dom.text().trim())
			return
		}

		// 切换二级菜单状态
		toggleSubNav($dom)

		// 逻辑
		doAction($dom.text().trim())
	}

	function doAction(action){
		switch(action){
			case '实时监控':
				getDocument({
					file_functionAnd: getFileFunction('实时监控'),
					file_type: 'mp4'
				}, function(err, fileList){
					if(err){
						$.alert(err, '错误')
					}else{
						$('#placeContainer').html('<video id="video" autoplay="autoplay" controls="controls"></video>')
						$video = $('#placeContainer video')
						$video.width($('body').width())
						$video.height($('body').height() - 100)

						var mediaSrcs = []
						fileList.forEach(function(file){
							mediaSrcs.push('http://202.121.178.184:4022/resource/视频/mp4/' + file.file_name)
						})
						playVideos($video, mediaSrcs)
					}
				})
				break
			case '数字巡检':
				getDocument({
					file_functionAnd: getFileFunction('数字巡检'),
					file_type: 'mp4'
				}, function(err, fileList){
					if(err){
						$.alert(err, '错误')
					}else{
						$('#placeContainer').html('<video id="video" autoplay="autoplay" controls="controls"></video>')
						$video = $('#placeContainer video')
						$video.width($('body').width())
						$video.height($('body').height() - 100)

						var mediaSrcs = []
						fileList.forEach(function(file){
							mediaSrcs.push('http://202.121.178.184:4022/resource/视频/mp4/' + file.file_name)
						})
						playVideos($video, mediaSrcs)
					}
				})
				break
			case '文库检索':
				$('#docContainer').html('<div class="weui-panel">\
						<div class="weui-cells weui-cells_form">\
							<div class="weui-cell">\
								<div class="weui-cell__bd">\
									<i class="weui-icon-search"></i>\
									<input class="weui-input" id="filter" type="text">\
								</div>\
							</div>\
							<div class="weui-cell">\
								<div class="weui-cell__hd">\
									<label for="file_type" class="weui-label">文件类型</label>\
								</div>\
								<div class="weui-cell__bd">\
									<input class="weui-input" id="file_type" type="text" value readonly>\
								</div>\
							</div>\
							<div class="weui-cell">\
								<div class="weui-cell__bd">\
									<button class="weui-btn weui-btn_primary" id="fileSearchBtn">搜索</button>\
								</div>\
							</div>\
						</div>\
						<div class="weui-cells" id="filesFound"></div>\
					</div>')

				$('#file_type').select({
					title: '文件类型',
					multi: true,
					items: [
						{
							title: '文档',
							value: 'doc/docs/pdf/txt/xls/xlsx'
						},
						{
							title: '图片',
							value: 'bmp/jpg/jpeg/png'
						},
						{
							title: '视频',
							value: 'avi/flv/mp4/swf'
						},
						{
							title: '图纸',
							value: 'dwg'
						},
						{
							title: '模型',
							value: 'ifc/rvt'
						}
					]
				})

				// 默认所有文件类型都搜索
				var file_type = $('input#file_type').first().val('文档,图片,视频,图纸,模型')

				$('#fileSearchBtn').on('click', function(event){
					event.preventDefault()
					
					$('.close-select').trigger('click') // 关闭可能正在显示的选择器
					$('#filesFound').html('') // 清空上次搜索结果

					// 构造搜索参数
					var name_filter = $('input#filter').first().val().trim()
					var file_types = $('input#file_type').first().val().trim()
					
					if(file_types === ''){
						$.toast('请选择文件类型', 'forbidden')
						return
					}

					file_types = file_types.split(',')
					var file_type_filter = ''
					file_types.forEach(function(type){
						file_type_filter += fileTypes[type] + '/'
					})

					// 正在加载数据(加载时间长时显示)
					$('#filesFound').html('<div class="weui-loadmore">\
							<i class="weui-loading"></i>\
							<span class="weui-loadmore__tips">正在加载</span>\
						</div>')

					// 查询
					getDocument({
						file_functionOr: '111111111111111100000000000000"',
						name: name_filter,
						file_type: file_type_filter
					}, function(err, files){
						if(err){
							$('#filesFound').html('')
							$.toast(err, 'forbidden')
						}else{
							var html = ''
							files.forEach(function(file){
								var fileType = file.file_type
								if('doc/docs/pdf/txt/xls/xlsx/dwg/ifc/rvt'.indexOf(fileType) !== -1){
									html += '<div class="weui-cell">\
										<div class="weui-cell__hd">\
											<img src="./public/images/document.png">\
										</div>'
								}else if('bmp/jpg/jpeg/png'.indexOf(fileType) !== -1){
									html += '<div class="weui-cell">\
										<div class="weui-cell__hd">\
											<img src="./public/images/pic.png">\
										</div>'
								}else if('avi/flv/mp4/swf'.indexOf(fileType) !== -1){
									html += '<div class="weui-cell">\
										<div class="weui-cell__hd">\
											<img src="./public/images/video.png">\
										</div>'
								}
								html += '<div class="weui-cell__bd"><p target="'+file.file_id+'">'+file.file_name+'</p></div></div>'
							})
							$('#filesFound').html(html)
							$('#filesFound p').on('click', function(event){
								event.preventDefault()
								var $dom = $(this).parent().parent()
								var fileId = $(this).attr('target')
								$.actions({
									actions: [{
										text: '下载',
										className: 'color-primary',
										onClick: function(){
											$.toast('暂时无法下载文件')
										}
									},{
										text: '删除',
										className: 'color-danger',
										onClick: function(){
											deleteFile(fileId, function(err){
												if(err){
													$.toast(err, 'forbidden')
												}else{
													$.toast('文件删除成功')
													$dom.remove()
												}
											})
										}
									}]
								})
							})
						}
					})
				})

				break
			case '资料上传':
				$('#docContainer').html('<div class="weui-panel">\
						<div class="weui-cells weui-cells_form">\
							<div class="weui-cell">\
								<div class="weui-cell__bd">\
									<div class="weui-uploader">\
										<div class="weui-uploader__hd">\
											<p class="weui-uploader__title">文件上传</p>\
										</div>\
										<div class="weui-uploader__bd">\
											<div class="weui-uploader__input-box">\
												<input id="uploaderInput" class="weui-uploader__input" type="file" multiple="multiple">\
											</div>\
										</div>\
									</div>\
								</div>\
							</div>\
						</div>\
						<div class="weui-cells" id="filesUpload"></div>\
					</div>')

				// 文件选择事件
				var uploadFiles = []
				$('#docContainer input#uploaderInput').on('change', function(event){
					event.preventDefault()

					uploadFiles = this.files
					var html = ''
					for(var i = 0; i < this.files.length; ++i){
						var file = this.files[i]
						var fileSize = file.size < 1048576? Math.round(file.size / 1024) + 'Kb': Math.round(file.size / 1048576) + 'Mb'
						html += '<div class="weui-cell">\
								<div class="weui-cell__bd" style="width:100%;">\
									<p style="word-wrap:break-word;white-space:normal;" target="'+file.name+'">'+file.name+'<span style="float:right;" class="color-primary">&nbsp;文件大小：'+fileSize+'</span></p>\
									<div class="weui-progress">\
										<div class="weui-progress__bar">\
											<div class="weui-progress__inner-bar js_progress" style="width: 0%;"></div>\
										</div>\
									</div>\
								</div>\
							</div>'
					}
					$('#docContainer #filesUpload').html(html)

					$('#docContainer #filesUpload p').on('click', function(event){
						event.preventDefault()
						$dom = $(this).parent().parent()
						// 获取要上传的文件
						var file = getFileByName(uploadFiles, $(this).attr('target'))

						$.actions({
							actions: [{
								text: '开始上传',
								className: 'color-primary',
								onClick: function(){
									$dom.find('p').unbind('click') // 开始上传后不能再取消或上传
									var form = new FormData()
									form.append("file_modelID", '1166610876235968')
									form.append("file_function", '111111111111111100000000000000')
									form.append("file", file)

									function progressHandlingFunction($dom, e){
										if(e.lengthComputable){
											var percentage = (e.loaded / e.total) * 100 + '%'
											$dom.find('div.weui-progress__inner-bar').css('width', percentage)
										}
									}
									
									$.ajax({
										url: 'http://202.121.178.184:4022/YuHang/uploadFile',
										method: 'POST',
										data: form,
										processData: false,
										contentType: false,
										mimeType: 'multipart/form-data',
										xhr: function(){
											var myXhr = $.ajaxSettings.xhr()
											if(myXhr.upload){
												myXhr.upload.addEventListener('progress', progressHandlingFunction.bind(this, $dom), false)
											}
											return myXhr
										}
									}).then(function(res){
										res = JSON.parse(res)
										if(res.code === 'success'){
											$.toast('文件上传成功')
										}else if(res.code === 'file_name.exits'){
											$.toast('文件已存在', 'forbidden')
										}else{
											$.toast('文件上传失败', 'forbidden')
										}
										$dom.remove()
										$('#uploaderInput').val('')
									}).catch(function(err){
										console.log(err)
										$.toast('文件上传失败', 'forbidden')
										$('#uploaderInput').val('')
									})
								}
							}, {
								text: '取消上传',
								className: 'color-danger',
								onClick: function(){
									$('#uploaderInput').val('')
									$dom.remove()
								}
							}]
						})
					})


				})
				break
			default:
				$('.container').html('<div class="weui-loadmore">\
					  <i class="weui-loading"></i>\
					  <span class="weui-loadmore__tips">正在加载</span>\
					</div>\
					<div class="weui-loadmore weui-loadmore_line">\
					  <span class="weui-loadmore__tips">暂无数据</span>\
					</div>\
					<div class="weui-loadmore weui-loadmore_line weui-loadmore_dot">\
					  <span class="weui-loadmore__tips"></span>\
					</div>')
				break
		}
	}

	function getFileByName(files, name){
		for(var i = 0; i < files.length; ++i){
			var file = files[i]
			if(file.name === name){
				return file
			}
		}
		return null
	}

	function deleteFile(file_id, callback){
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

	function playVideos($videoDom, mediaSrcs){
		var index = 0
		function play(index){
			if(index >= mediaSrcs.length){
				return
			}
			var mediaSrc = mediaSrcs[index]
			$videoDom.attr('src', mediaSrc)
			$videoDom.get(0).play()
			$videoDom.on('ended', function(event){
				event.preventDefault()
				index += 1
				play(index)
			})
		}
		play(index)
	}

	function getDocument(condition, callback){
		$.get('http://202.121.178.184:4022/YuHang/fileList', condition)
		.then(function(res){
			if(res.code === 'success'){
				var files = res.data.fileList
				if(files.length === 0){
					callback('暂无数据', [])
				}else{
					callback(undefined, files)
				}
			}else{
				callback('暂无数据', [])
			}
		}).catch(function(err){
			console.log(err)
			callback('无法获取文件', [])
		})
	}

	function getFileFunction(name){
		return file_functions[name]
	}

	function toggleSubNav($dom){
		$dom.addClass('weui-bar__item_on')

		$dom.siblings().each(function(index, dom){
			var $dom = $(dom)
			if($dom.hasClass('weui-bar__item_on')){
				$dom.removeClass('weui-bar__item_on')
			}
		})
	}

	function navbarClick(event){
		event.preventDefault()

		var $dom = $(this)

		if($dom.hasClass('weui-bar__item_on')){
			return
		}
		// 切换一级菜单状态
		toggleNav($dom)

		// 显示界面
		showPanel($dom.text().trim())

		$('#' + navMap[$dom.text().trim()]).find('.weui-navbar__item').first().trigger('click')
	}

	function toggleNav($dom){
		$dom.addClass('weui-bar__item_on')
		$img = $dom.find('img').first()
		var imgSrc = $img.attr('src')
		imgSrc = imgSrc.substring(0, imgSrc.length - 4) + '-active.png'
		$img.attr('src', imgSrc)

		$dom.siblings().each(function(index, dom){
			$dom = $(dom)
			if($dom.hasClass('weui-bar__item_on')){
				$dom.removeClass('weui-bar__item_on')
				$img = $dom.find('img').first()
				var imgSrc = $img.attr('src')
				imgSrc = imgSrc.substring(0, imgSrc.length - 11) + '.png'
				$img.attr('src', imgSrc)
			}
		})
	}

	function showPanel(navName){
		for(var name in navMap){
			if(name === navName){
				$('#' + navMap[navName]).show()
			}else{
				$('#' + navMap[name]).hide()
			}
		}
	}

})