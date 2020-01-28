$(function() {
	let Sizes = JSON.parse($("#sizes").val());
	let ajaxOrderNewPd = "/bsOrderNewPdAjax";	// orderAdd 操作 order中的 pd
	let ajaxOrderUpdPd = "/bsOrderUpdPdAjax";
	let ajaxOrderDelPd = "/bsOrderDelPdAjax";

	let ordpds = new Array();	// 在订单中的产品
	let selPds = new Array();	// 本次模糊查找出的产品
	let selPd = new Object();	// 本次选中的产品



	/* ====================== 模特型号输入框，输入型号，模糊获得产品 ====================== */
	// 输入产品名称，获取pdfirs， 模糊查询，只要有相应的数字全部显示
	$("#ajaxPdsForm").on('input', '#ajaxPdsCode', function(e) {
		let code = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(code.length > 2){
			$('.prodCard').remove(); // 清除上次的ajaxProds
			$('.prodShow').remove(); // 清除上次的ajaxProds
			let keyword = encodeURIComponent(code);	// 转化码
			let url = '/bsOrderProdsAjax?keyword='+keyword;
			getObjects(url, code);
		}
	});
	// 后台获取 模糊 products
	let getObjects = function(url, code) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				selPds = new Array();
				for(let i in results.pdfirs) {
					/* ------ 如果订单中 已经有了此产品, 则不显示 ----- */
					let j = 0;
					for(; j<ordpds.length; j++) {
						if(results.pdfirs[i]._id == ordpds[j]._id) {
							break;
						}
					}
					if(j==ordpds.length) {
						selPds.push(results.pdfirs[i])
					}
					/* ------ 如果订单中 已经有了此产品, 则不显示 ----- */

					/* ------ 是否有完全匹配的产品 ----- */
					if(results.pdfirs[i].code == code) {
						selPd = selPds[i];
					}
					/* ------ 是否有完全匹配的产品 ----- */
				}
				let str = "";
				if(selPd.code) {
					str += showObjs(selPd)
				}
				for(let i in selPds) {
					if(selPds[i].code == code) continue;
					str += showObjs(selPds[i])
				}
				$("#prodPage").append(str);
			}
		})
	}
	// 前端显示获取的 products
	let showObjs = function(pdfir) {
		let str = "";

		let price;
		if(pdfir.price && !isNaN(pdfir.price)){
			price = (pdfir.price).toFixed(2) + ' €';
		}

		str += '<div class="p-2 my-3 border bg-light prodCard prodCard-'+pdfir._id+'" ';
		str += 'id="prodCard-'+pdfir._id+'">'
			str += '<div class="row">'
				str += '<div class="col-lg-4">'
					str += '<img class="ml-1" src='+dns+pdfir.photo;
					str += ' width="95%" style="max-width: 90px; max-height: 120px"/>';
				str += '</div>';
				str += '<div class="col-lg-8">'
					str += '<div class="row">'

						str += '<h3 class="col-lg-12 text-left">'+pdfir.code+'</h3>';

						str += '<div class="col-lg-12 text-left">'+pdfir.nome+'</div>';

						str += '<div class="col-lg-12 text-left">'+price+'</div>';

					str += '</div>';
				str += '</div>';
			str += '</div>';

		str += '<div class="row">';
			str += '<div class="col-lg-12 text-right">';
				str += '<button class="btn btn-danger delAjax" data-id='+pdfir._id;
				str += ' type="button" style="display:none">Del</button>';
			str += '</div>';
		str += '</div>';

		str += '</div>';
		
		return str;
	}
	/* ====================== 模特型号输入框，输入型号，模糊获得产品 ====================== */









	/* ======================= 点击目标产品，显示产品的信息，并加以选择 ======================= */
	/* -------------------- 颜色的选择 -------------------- */
	$("#prodPage").on('click', '.colorSel', function(e) {
		if($(this).attr("checked")) {
			$(this).removeAttr("checked");
		} else {
			$(this).attr("checked","true");
		}
	})
	// 点击全选按钮，选择所有颜色
	$("#prodPage").on('click', '.colorAll', function(e) {
		$(".colorSel").each(function(index,elem) {
			$(this).attr("checked","true");
			$(this).prop("checked", true);
		})
	})
	// 点击反选按钮，反向选择颜色
	$("#prodPage").on('click', '.colorReverse', function(e) {
		$(".colorSel").each(function(index,elem) {
			if($(this).attr("checked")) {
				$(this).removeAttr("checked");
				$(this).prop("checked", false);
			} else {
				$(this).attr("checked","true");
				$(this).prop("checked", true);
			}
		})
	})
	// 点击取消按钮，取消所有颜色
	$("#prodPage").on('click', '.colorDel', function(e) {
		$(".colorSel").each(function(index,elem) {
			$(this).removeAttr("checked");
			$(this).prop("checked", false);
		})
	})
	/* -------------------- 颜色的选择 -------------------- */

	// 根据id 获取需要的那个product
	$("#prodPage").on('click', '.prodCard', function(e) {
		let firId = ($(this).attr('id')).split('-')[1];
		let i = 0;
		for(; i<selPds.length; i++) {
			if(selPds[i]._id == firId) {
				selPd = selPds[i];
				break;
			}
		}
		if(i==selPds.length) {
			alert('请重新输入')
		} else {
			$('.prodCard').remove(); // 清除上次的ajaxProds
			$('.prodShow').remove(); // 清除上次的ajaxProds
			showProd(selPd)
		}
	})

	// 前端展示此product的基本信息
	let showProd = function(pdfir) {
		let price = "";
		if(pdfir.price && !isNaN(pdfir.price)){
			price = (pdfir.price).toFixed(2) + ' €';
		}

		let str = "";

		// 先判断 ordpds 中是否有此编号的产品
		let exist = 0;
		for(let i=0; i<ordpds.length; i++) {
			if(String(ordpds[i].code) == String(pdfir.code)) {
				exist = 1; break;
			}
		}
		if(exist == 1) {
			// str += '<div class="row text-center">'
			// 	str += '<div class="col-lg-12">';
			// 		str= '<a class="btn btn-info" href="#anchor-'+pdfir._id+'"> 查看 </a>'
			// 	str += '</div>';
			// str += '</div>';
		} else {
			str += '<div class="my-3 p-2 border bg-light prodShow">';
				str += '<div class="row text-center">'
					str += '<div class="col-lg-12 col-xl-6">';
					str += '<h3 text-info>'+pdfir.code+'</h3>';
					str += '</div>';

					str += '<div class="col-lg-12 col-xl-6">';
					str += '<span>'+pdfir.nome+'</span>';
					str += '</div>';

					str += '<div class="col-lg-12 col-xl-6">';
					str += '<span>('+pdfir.material+')</span>';
					str += '</div>';

					str += '<div class="col-lg-12 col-xl-6">';
					str += '<span>'+price+'</span>';
					str += '</div>';
				str += '</div>';
				str += '<hr/>';
				str += '<div class="row m-2">'
					str += '<div class="col-12 mb-2">';
						str += '<button class="colorAll" type="button">全选</button>'
						str += '<button class="colorReverse" type="button">反选</button>'
						str += '<button class="colorDel" type="button">取消</button>'
					str += '</div>';
					for(let i in pdfir.pdsecs) {
						let color = pdfir.pdsecs[i].color;
						str += '<div class="col-lg-12 col-xl-6">';
							str += '<input class="form-check-input colorSel" type="checkbox"'
							str += ' name="colorSel" value='+color+'>';
							str += '<label class="form-check-label">'+color+'</label>'
						str += '</div>';
					}
					str += '<div class="col-12 m-2 text-right">';
						str += '<button class="btn btn-info confirm" type="button"> 确定 </button>'
					str += '</div>';
				str += '</div>';
				str += '<hr/>';
			str += '</div>';
		}
		
		$("#prodPage").append(str);
	}
	/* ======================= 点击目标产品，显示产品的信息，并加以选择 ======================= */









	/* ======================= 点击加入，显示在右侧订单窗口 ======================= */
	// 点击加入键 在order页面生成表格
	$("#prodPage").on('click', '.confirm', function(e) {
		let selSizes = selPd.sizes;

		let selColors = new Array();
		$('input:checked').each(function() {
			if($(this).attr('checked') == "checked") {
				let val = $(this).val();
				selColors.push(val)
			}
		})
		let pdsecs = new Array();
		for(let i in selPd.pdsecs) {
			let pdsec = selPd.pdsecs[i];
			for(let j in selColors) {
				let selColor = selColors[j];
				if(pdsec.color == selColor) {
					pdsecs.push(pdsec)
				}
			}
		}
		selPd.pdsecs = pdsecs;

		ordpds.push(selPd)

		$(".prodShow").remove()
		$(".changeTd").remove()
		$("#ajaxPdsCode").val('')

		$("#ajaxPdsForm").hide();
		$("#pdcode").text(selPd.code)
		
		for(i in selSizes) {
			let size = selSizes[i]
			$("#changeTh").before('<th> </th>')
			$("#changeSize").before('<th>'+Sizes[size]+'</th>')
		}

		$("#objFir").val(selPd._id)

		let str="";
		for(let i=0; i<selPd.pdsecs.length; i++) {
			let pdsec = selPd.pdsecs[i];

			str += showCompletePd(pdsec, i)
		}

		$("#changeElem").after(str)
	})
	/* ------------------------------- 添加成品 ------------------------------- */
	let showCompletePd = function(pdsec, i) {
		let str="";

		str += '<tr>';
		str += '<td>';
			str += '<input type="hidden" name="obj[secs]['+i+'][pdsecId]" value='+pdsec._id+'>'
			str += '<input type="hidden" name="obj[secs]['+i+'][color]" value='+pdsec.color+'>'
		str += '</td>'
		str += '<td></td>';
		str += '<th class="color color-'+pdsec.color+'">' + pdsec.color + '</th>'
		for(let j=0; j<pdsec.pdthds.length; j++) {
			let pdthd = pdsec.pdthds[j];
			str += '<td>'
				str += '<input class="iptsty ordQt '+pdsec.color+'" type="number" value='+0;
				str += ' name="obj[secs]['+i+'][thds]['+j+'][quot]" >'

				str += '<input type="hidden" value='+pdthd._id;
				str += ' name="obj[secs]['+i+'][thds]['+j+'][pdthdId]" >'

				str += '<input type="hidden" value='+pdsec.color;
				str += ' name="obj[secs]['+i+'][thds]['+j+'][color]" >'

				str += '<input type="hidden" value='+pdthd.size;
				str += ' name="obj[secs]['+i+'][thds]['+j+'][size]" >'
			str += '</td>'
		}
		str += '<td class="bg-secondary">'
			str += '<input class="iptsty ordQtSync" id='+pdsec.color+' type="number" >'
		str += '</td>'
		str += '</tr>'

		return str;
	}
	/* ------------------------------- 添加成品 ------------------------------- */
	/* ======================= 点击加入，显示在右侧订单窗口 ======================= */

	/* ============== 焦点落在添加颜色上，则去除被选中颜色 ============== */
	$("#orderProducts").on('focus', '.addColor', function(e) {
		let color = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		$(".color").each(function(index,elem) {
			$(this).removeClass('bg-success');
		})
	})
	/* ============== 焦点落在添加颜色上，则去除被选中颜色 ============== */
	/* ============== 在添加新订单的表格中 添加颜色 ============== */
	$("#orderProducts").on('blur', '.addColor', function(e) {
		let thisIpt = $(this);
		if(!selPd || !selPd.pdsecs) {
			thisIpt.val('');
			return;
		}
		let color = $(this).val().replace(/\s+/g,"").toUpperCase();
		thisIpt.val('')
		if(color.length == 0) return;
		let symble = null;
		if(color[0] == '+') {
			symble = color[0];
			color = color.split('+')[1];
		}
		if(color.length == 0) return;
		let icl=0
		for(; icl<selPd.pdsecs.length; icl++) {
			if(selPd.pdsecs[icl].color == color) {
				$(".color-"+color).addClass("bg-success")
				break;
			}
		}
		if(icl == selPd.pdsecs.length) {
			$.ajax({
				type: 'get',
				url: '/bsProductGetColor?id='+selPd._id+'&color='+color
			})
			.done(function(results) {
				if(results.success === 1){
					let pdsec = results.pdsec;
					let str = '', i = selPd.pdsecs.length;
					str += showCompletePd(pdsec, i)
					$("#changeElem").after(str)
					selPd.pdsecs.push(pdsec)
				} else if(results.success === 0) {
					// console.log('无, 要自动添加此颜色')
					if(symble == '+'){
						let pdfirId = selPd._id
						$.ajax({
							type: "GET",
							url: '/bsProdNewColorAjax?from=1&pdfirId='+pdfirId+'&color='+color,
							success: function(results) {
								if(results.success == 1) {
									let pdsec = results.pdsec;
									let str = '', i = selPd.pdsecs.length;
									str += showCompletePd(pdsec, i)
									$("#changeElem").after(str)
									selPd.pdsecs.push(pdsec)
								} else {
									alert(results.info);
								}
							}
						});
					} else {
						thisIpt.val(color);
						alert("模特中没有此颜色, 想要添加颜色, 请在颜色前面加 '+' 符号");
					}
				} else {
					// console.log('错')
					alert(results.info);
				}
			})
		}
	})
	/* ============== 在添加新订单的表格中 添加颜色 ============== */

	/* ================== 同步同颜色的数量 ================== */
	$("#orderProducts").on('blur', '.ordQtSync', function(e) {
		let quot = $(this).val();
		let colorId = $(this).attr("id");
		$("."+colorId).each(function(index,elem) {
			$(this).val(quot);
		})
	})
	/* ================== 同步同颜色的数量 ================== */

	/* ================== 焦点离开 数量 ================== */
	$("#orderProducts").on('blur', '.ordQt', function(e) {
		let quot = parseInt($(this).val());
		// console.log(orgQt)
		if(isNaN(quot)){
			alert("只接收数字")
			$(this).val(0)
		} else if(quot < 0) {
			alert("不可以输入负数")
			$(this).val(0)
		}
	})
	/* ================== 焦点离开 数量 ================== */




	/* ============ 提交表单 ============ */
	$("#submitBtn").click(function(e) {
		let isCter = $("#objCter").val();
		if(ordpds && ordpds.length == 0) {
			alert("请选择模特")
			e.preventDefault();
		} else if(isCter.length < 1){
			alert("请选择客户")
			e.preventDefault();
		} else {
			$("#orderNew").submit();
		}
	})
	/* ============ 提交表单 ============ */
} );