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

	// 一级菜单点击事件
	$('div.weui-tabbar a').on('click', navbarClick)

	// 二级菜单点击事件
	$('div.weui-navbar div.weui-navbar__item').on('click', subNavbarClick)

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
						// $('#placeContainer').append('<video id="video" style="width:100%;height:100%;"></video>')
						// console.log(fileList)
						// var video = videojs('video')
						// video.src('http://202.121.178.184:4022/resource/视频/mp4/' + fileList[0].file_name)
						// video.load()
						var mediaSrc = 'http://202.121.178.184:4022/resource/视频/mp4/' + fileList[0].file_name
						$('#placeContainer').append('<video src="'+mediaSrc+'" controls="controls">')
					}
				})
				break
			default:
				alert(action)
				break
		}
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