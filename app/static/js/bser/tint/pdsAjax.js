$(function() {
	let Sizes = JSON.parse($("#sizes").val());
	let ajaxOrderNewPd = "/bsOrderNewPdAjax";	// tintAdd 操作 tint中的 pd
	let ajaxOrderUpdPd = "/bsOrderUpdPdAjax";
	let ajaxOrderDelPd = "/bsOrderDelPdAjax";

	let ordpds = new Array();	// 在订单中的产品
	let selPds = JSON.parse($("#products").val());	// 本次模糊查找出的产品
	let selPd = new Object();	// 本次选中的产品



	/* ====================== 模特型号输入框，输入型号，模糊获得产品 ====================== */
	// 输入产品名称，获取pdfirs， 模糊查询，只要有相应的数字全部显示
	$("#ajaxPdsForm").on('input', '#ajaxPdsCode', function(e) {
		let str = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length > 2){
			$('.prodCard').remove(); // 清除上次的ajaxProds
			$('.prodShow').remove(); // 清除上次的ajaxProds
			let keyword = encodeURIComponent(str);	// 转化码
			let url = '/bsOrderProdsAjax?keyword='+keyword;
			getObjects(url);
		}
	});
	// 后台获取 模糊 products
	let getObjects = function(url) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				selPds = new Array();
				for(let i in results.pdfirs) {
					let j = 0;
					for(; j<ordpds.length; j++) {
						if(results.pdfirs[i]._id == ordpds[j]._id) {
							break;
						}
					}
					if(j==ordpds.length) {
						selPds.push(results.pdfirs[i])
					}
				}
				for(let i in selPds) {
					showObjs(selPds[i])
				}
			}
		})
	}
	// 前端显示获取的 products
	let showObjs = function(pdfir) {
		let price;
		if(pdfir.price && !isNaN(pdfir.price)){
			price = (pdfir.price).toFixed(2) + ' €';
		}

		let str = "";
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
		
		$("#prodPage").append(str);
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
							str += 'checked="checked" name="colorSel" value='+color+'>';
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


	/* ======================= 点击需要生产的模特 ======================= */
	$(".pneed").click(function(e) {
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
			let selSizes = selPd.sizes;

			let selColors = JSON.parse($("#colors-"+firId).val());
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

			let str = '';
			str += showCompletePd();

			$("#changeElem").after(str)
			$('#needTinBtns').remove();
		}
	})
	/* ======================= 点击需要生产的模特 ======================= */


	/* ======================= 点击加入，显示在右侧订单窗口 ======================= */
	// 点击加入键 在tint页面生成表格
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

		let str = '';
		str += showCompletePd();

		$("#changeElem").after(str)
		$('#needTinBtns').remove();
	})
	let showCompletePd = function() {
		let str="";
		str += '<tr>';
			str += '<td></td>';
			str += '<td></td>';
			str += '<td>半成品</td>';
			let stocks = new Array();
			for(let j=0; j<selPd.pdsezs.length; j++) {
				let pdsez = selPd.pdsezs[j];

				let quotMsez = shipMsez = 0;
				let quotOthds = shipOthds = 0;
				let quotTthds = shipTthds = 0;
				let needTthds = 0;
				for(let m=0; m<pdsez.macsezs.length; m++) {
					let macsez = pdsez.macsezs[m];
					quotMsez+=parseInt(macsez.quot);
					shipMsez+=parseInt(macsez.ship);
				}
				for(let k=0; k<pdsez.pdthds.length; k++) {
					let pdthd = pdsez.pdthds[k];
					let quotOthd = quotTthd = 0;
					let shipOthd = shipTthd = 0;
					for(let m=0; m<pdthd.ordthds.length; m++){
						let ordthd = pdthd.ordthds[m];
						quotOthd += parseInt(ordthd.quot)
						shipOthd += parseInt(ordthd.ship)
					}
					for(let m=0; m<pdthd.tinthds.length; m++){
						let tinthd = pdthd.tinthds[m];
						quotTthd += parseInt(tinthd.quot)
						shipTthd += parseInt(tinthd.ship)
					}
					quotTthds += quotTthd;
					shipTthds += shipTthd;
					needTthds += quotOthd - pdthd.stock- quotTthd;
				}

				let showSezStock = parseInt(pdsez.stock) + shipMsez - quotTthds;
				let needMac = needTthds - showSezStock - (quotMsez - shipMsez);

				str += '<td>'
					str += '<span>' + showSezStock + '</span>';
					str += '<input type="hidden" value='+showSezStock;
					str += ' id="pdsez-'+pdsez._id+'" >'
				str += '</td>'
				stocks[j] = parseInt(showSezStock);
			}
		str += '</tr>';
		for(let i=0; i<selPd.pdsecs.length; i++) {
			let pdsec = selPd.pdsecs[i];
			str += '<tr>';
			str += '<td>';
				str += '<input type="hidden" name="obj[secs]['+i+'][pdsecId]" value='+pdsec._id+'>'
			str += '<td>';
			str += '<th>' + pdsec.color + '</th>'
			for(let j=0; j<pdsec.pdthds.length; j++) {
				let pdthd = pdsec.pdthds[j];
				let needTin = 0;
				let quotOthd = shipOthd = 0;
				let quotTthd = shipTthd = 0;
				for (let m = 0; m < pdthd.ordthds.length; m++) {
					let ordthd = pdthd.ordthds[m];
					if(!isNaN(parseInt(ordthd.quot))) {
						quotOthd += parseInt(ordthd.quot);
					}
					if(!isNaN(parseInt(ordthd.ship))) {
						shipOthd += parseInt(ordthd.ship);
					}
				}
				for(let m=0; m<pdthd.tinthds.length; m++) {
					let tinthd = pdthd.tinthds[m];
					if(!isNaN(parseInt(tinthd.quot))) {
						quotTthd += parseInt(tinthd.quot);
					}
					if(!isNaN(parseInt(tinthd.ship))) {
						shipTthd += parseInt(tinthd.ship);
					}
				}
				needTin = quotOthd - quotTthd - parseInt(pdthd.stock);
				let dye = 0;
				if(needTin>0) {
					if(stocks[j] < needTin) {
						dye = stocks[j];
					} else {
						dye = needTin;
					}
					stocks[j] -= dye;
				} else {
					needTin = 0;
				}

				str += '<td>'
					str += '<span class="text-secondary">' + needTin + '</span> ';

					str += '<input class="iptsty2 ordQt thdsez-'+pdthd.pdsez+'" value='+dye;
					str += ' id="thdsez-'+pdthd.pdsez+'-'+pdthd._id+'" ';
					str += ' type="number" name="obj[secs]['+i+'][thds]['+j+'][quot]" >'

					str += '<input type="hidden" value='+pdthd._id;
					str += ' name="obj[secs]['+i+'][thds]['+j+'][pdthdId]" >'

					str += '<input type="hidden" value='+pdthd.color;
					str += ' name="obj[secs]['+i+'][thds]['+j+'][color]" >'

					str += '<input type="hidden" value='+pdthd.size;
					str += ' name="obj[secs]['+i+'][thds]['+j+'][size]" >'
				str += '</td>'
			}
			str += '</td>'
			str += '</td>'
			str += '</tr>'
		}
		return str;
	}
	/* ------------------------------- 添加成品 ------------------------------- */
	/* ======================= 点击加入，显示在右侧订单窗口 ======================= */









	/* ============================= 焦点离开 数量限定 ============================= */
	$("#tintProducts").on('blur', '.ordQt', function(e) {
		let pdsezId = ($(this).attr('id')).split('-')[1];
		let stock = parseInt($("#pdsez-"+pdsezId).val())
		let thisVal = parseInt($(this).val())
		let dyings = 0;
		$(".thdsez-"+pdsezId).each(function(index,elem) {
			let dying = parseInt($(this).val());
			if(!isNaN(dying)) {
				dyings += dying;
			}
		})
		if(dyings > stock) {
			$(this).val(stock - dyings + thisVal)
		}
	})
	/* ============================= 焦点离开 数量 ============================= */



	$("#tintNew").submit(function(e) {
		let isTner = $("#objTner").val();
		if(ordpds && ordpds.length == 0) {
			alert("请选择模特")
			e.preventDefault();
		} else if(isTner.length < 1){
			alert("请选择染洗厂")
			e.preventDefault();
		}
	})
} );