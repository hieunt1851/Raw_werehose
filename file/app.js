function toast_show(message, type = 'success', duration = 3000) {
    // Loại toast (success, danger, warning, info)
    const bgClass = {
      success: 'bg-success',
      danger: 'bg-danger',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-dark'
    }[type] || 'bg-secondary';

    // Tạo phần tử toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
      </div>
    `;

    // Thêm vào container (tạo nếu chưa có)
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = 1055;
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Khởi tạo và hiển thị toast
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();

    // Tự xoá sau khi ẩn (dọn DOM)
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
}

function ncc_change(ele) {
    var wrap_ncc = $(ele).closest('.wrap_ncc');
    var ncc = $(ele).val();
    var current_ncc = wrap_ncc.find('input[name=current_ncc]').val();

    if (!ncc || ncc == '' || current_ncc == ncc) {
        return;
    }

    if (current_ncc && current_ncc != ncc) {
        const modalEl = document.getElementById('popup_ncc_change');
        const myModal = new bootstrap.Modal(modalEl);
        myModal.show();
    } else {
        console.log('NCC current: ', ncc);
        wrap_ncc.find('input[name=current_ncc]').val(ncc);

        ncc_change_update();
    }
}

function ncc_change_confirm(ok = 0) {
    var wrap_ncc = $('.wrap_ncc');
    var ncc = wrap_ncc.find('select[name=ncc]').val();
    console.log('NCC change to: ', ncc);

    if (parseInt(ok)) {
        console.log('NCC change confirmed');
        wrap_ncc.find('input[name=current_ncc]').val(ncc);

        ncc_change_update();
    } else {
        console.log('NCC change cancelled');
        wrap_ncc.find('select[name=ncc]').val(wrap_ncc.find('input[name=current_ncc]').val());
    }
}

function ncc_change_update() {
    var wrap_sensor = $('.wrap_sensor');
    var wrap_ncc = $('.wrap_ncc');
    var wrap_po = $('.wrap_po');
    var wrap_saved = $('.wrap_saved');

    var html = '';
    var current_ncc = wrap_ncc.find('input[name=current_ncc]').val();

    html += `<div class="table-responsive">
        <table class="table table-bordered">
        <thead class="table-light">
        <tr>
        <th class="text-center">STT</th>
        <th class="text-center">NVL</th>
        <th class="text-center">Định lượng</th>
        <th class="text-center">Đơn vị</th>
        <th class="text-center" style="font-size: 10px;">Sai số<br/>cho phép (%)</th>
        </tr>
        </thead>
        <tbody>
        `;

    if (current_ncc == 'meat') {
        wrap_ncc.find('.ncc_code').text('NCC_MEAT');
        wrap_ncc.find('.ncc_name').text('CTY Meat');
        wrap_ncc.find('.ncc_phone').text('090 123 4567');

        po_meat.forEach(function(nvl, index) {
            html += `
                <tr class="position-relative tr_${nvl.slug} cursor-pointer" onclick="nvl_view('${nvl.slug}')">
                    <td class="text-center">${nvl.id}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                    <td class="text-center">${nvl.diff}</td>
                </tr>
            `;
        });

    } else if (current_ncc == 'seafood') {
        wrap_ncc.find('.ncc_code').text('NCC_SEAFOOD');
        wrap_ncc.find('.ncc_name').text('CTY Seafood');
        wrap_ncc.find('.ncc_phone').text('090 456 7890');

        po_seafood.forEach(function(nvl, index) {
            html += `
                <tr class="position-relative tr_${nvl.slug} cursor-pointer" onclick="nvl_view('${nvl.slug}')">
                    <td class="text-center">${nvl.id}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                    <td class="text-center">${nvl.diff}</td>
                </tr>
            `;
        });
    }

    html += `</tbody>
        </table>
        </div>`;

    wrap_po.find('.datas_po').empty().append(html);

    wrap_sensor.find('.body_1').removeClass('d-none');
    wrap_sensor.find('.body_2').addClass('d-none');
    wrap_sensor.find('.img_photo img').attr('src', 'src/images/no_photo.png');

    wrap_saved.find('.saved_item').addClass('d-none');
    wrap_saved.find('.saved_item table tbody').empty();
}

var po_meat = [
    { id: 1, code: 'NVL_THIT001', name: 'Thịt bò', unit: 'kg', quantity: 8.00, diff: 1, slug: 'thit_bo', between: '7.92 -> 8.08', real: 7.90 },
    { id: 2, code: 'NVL_THIT002', name: 'Thịt gà', unit: 'kg', quantity: 6.00, diff: 2, slug: 'thit_ga', between: '5.88 -> 6.12', real: 5.50  },
    { id: 3, code: 'NVL_THIT003', name: 'Thịt heo', unit: 'kg', quantity: 5.00, diff: 3, slug: 'thit_heo', between: '4.85 -> 5.15', real: 5.30  },
];

var po_meat_orders = [
    {
        code: '20250707ORDER001',
        items: [
            { code: 'NVL_THIT001', name: 'Thịt bò', unit: 'kg', quantity: 4.00 },
            { code: 'NVL_THIT002', name: 'Thịt gà', unit: 'kg', quantity: 2.00 },
        ],
    },
    {
        code: '20250707ORDER002',
        items: [
            { code: 'NVL_THIT001', name: 'Thịt bò', unit: 'kg', quantity: 4.00 },
            { code: 'NVL_THIT002', name: 'Thịt gà', unit: 'kg', quantity: 4.00 },
        ],
    },
    {
        code: '20250707ORDER003',
        items: [
            { code: 'NVL_THIT003', name: 'Thịt heo', unit: 'kg', quantity: 5.00 },
        ],
    },
];

var po_seafood = [
    { id: 1, code: 'NVL_HS004', name: 'Tôm sú', unit: 'kg', quantity: 5.00, diff: 2, slug: 'tom_su', between: '4.90 -> 5.10', real: 5.30  },
    { id: 2, code: 'NVL_HS005', name: 'Mực lá', unit: 'kg', quantity: 8.00, diff: 3, slug: 'muc_la', between: '7.76 -> 8.24', real: 8.20  },
];

var po_seafood_orders = [
    {
        code: '20250707ORDER004',
        items: [
            { code: 'NVL_HS004', name: 'Tôm sú', unit: 'kg', quantity: 1.00 },
            { code: 'NVL_HS005', name: 'Mực lá', unit: 'kg', quantity: 2.00 },
        ],
    },
    {
        code: '20250707ORDER005',
        items: [
            { code: 'NVL_HS004', name: 'Tôm sú', unit: 'kg', quantity: 4.00 },
            { code: 'NVL_HS005', name: 'Mực lá', unit: 'kg', quantity: 6.00 },
        ],
    },
];

function po_view() {
    var wrap_ncc = $('.wrap_ncc');
    var current_ncc = wrap_ncc.find('input[name=current_ncc]').val();

    if (!current_ncc || current_ncc == '') {
        toast_show('Vui lòng chọn nhà cung cấp trước khi xem chi tiết đơn hàng.', 'danger');
        return;
    }

    var popup = $('#popup_po_view');
    var html = '';

    html += `<div class="table-responsive">`;

    if (current_ncc == 'meat') {
        po_meat_orders.forEach(function(order, count) {
            html += `
            <table class="table table-bordered">
            <tr>
                <th colspan="4" class="text-center">Đơn hàng: ${order.code}</th>
            </tr>
            <tr>
                <td class="text-center">STT</td>
                <td class="text-center">NVL</td>
                <td class="text-center">Định lượng</td>
                <td class="text-center">Đơn vị</td>
            </tr>
            <tbody>
            `;

            order.items.forEach(function(nvl, index) {
                html += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                </tr>
                `;
            });

            html += `
            </tbody>
            </table>
            `;
        });
    } else if (current_ncc == 'seafood') {
        po_seafood_orders.forEach(function(order, count) {
            html += `
            <table class="table table-bordered">
            <tr>
                <th colspan="4" class="text-center">Đơn hàng: ${order.code}</th>
            </tr>
            <tr>
                <td class="text-center">STT</td>
                <td class="text-center">NVL</td>
                <td class="text-center">Định lượng</td>
                <td class="text-center">Đơn vị</td>
            </tr>
            <tbody>
            `;

            order.items.forEach(function(nvl, index) {
                html += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                </tr>
                `;
            });

            html += `
            </tbody>
            </table>
            `;
        });
    }

    html += `</div>`;

    popup.find('.modal-body').empty().append(html);

    const modalEl = document.getElementById('popup_po_view');
    const myModal = new bootstrap.Modal(modalEl);
    myModal.show();
}

function number_random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function photo_take() {
    var wrap_sensor = $('.wrap_sensor');
    var wrap_ncc = $('.wrap_ncc');
    var current_ncc = wrap_ncc.find('input[name=current_ncc]').val();

    var img_1 = '';
    var img_2 = 'src/images/';
    var number = 1;
    var text_nvl = '';
    var arr_nvl = ['NVL_HS004 - Tôm sú', 'NVL_HS005 - Mực lá'];
    var count = Math.floor(Math.random() * arr_nvl.length);
    var current_nvl = '';
    var nvl_items = '';

    if (current_ncc == 'meat') {
        number = number_random(1, 13);
        img_2 += 'meat/thit_' + number + '.jpg';

        arr_nvl = ['NVL_THIT001 - Thịt bò', 'NVL_THIT002 - Thịt gà', 'NVL_THIT003 - Thịt heo'];
        count = Math.floor(Math.random() * arr_nvl.length);

        if (count == 0) {
            img_1 = 'src/images/thit_bo.jpg';
            current_nvl = 'thit_bo';
        } else if (count == 1) {
            img_1 = 'src/images/thit_ga.jpg';
            current_nvl = 'thit_ga';
        } else if (count == 2) {
            img_1 = 'src/images/thit_heo.jpg';
            current_nvl = 'thit_heo';
        }

        nvl_items = `<li><a class="dropdown-item" onclick="photo_nvl('thit_bo')" href="javascript:void(0)">NVL_THIT001 - Thịt bò</a></li>
        <li><a class="dropdown-item" onclick="photo_nvl('thit_ga')" href="javascript:void(0)">NVL_THIT002 - Thịt gà</a></li>
        <li><a class="dropdown-item" onclick="photo_nvl('thit_heo')" href="javascript:void(0)">NVL_THIT003 - Thịt heo</a></li>`;

    } else if (current_ncc == 'seafood') {
        number = number_random(1, 7);
        img_2 += 'seafood/sea_' + number + '.jpg';

        if (count == 0) {
            img_1 = 'src/images/tom_su.jpg';
            current_nvl = 'tom_su';
        } else if (count == 1) {
            img_1 = 'src/images/muc_la.jpg';
            current_nvl = 'muc_la';
        }

        nvl_items = `<li><a class="dropdown-item" onclick="photo_nvl('tom_su')" href="javascript:void(0)">NVL_HS004 - Tôm sú</a></li>
        <li><a class="dropdown-item" onclick="photo_nvl('muc_la')" href="javascript:void(0)">NVL_HS005 - Mực lá</a></li>`;

    } else {
        toast_show('Vui lòng chọn nhà cung cấp trước khi chụp ảnh.', 'danger');
        return;
    }

    wrap_sensor.find('.body_1').addClass('d-none');
    wrap_sensor.find('.body_2').removeClass('d-none');
    wrap_sensor.find('.img_photo img').attr('src', img_2);

    text_nvl = arr_nvl[count];

    wrap_sensor.find('.img_stats .img_1').attr('src', img_1);
    wrap_sensor.find('.img_stats .img_2').attr('src', img_2);

    wrap_sensor.find('.img_stats .nvl_name').text(text_nvl);
    wrap_sensor.find('.img_stats .nvl_quantity').text(number_random(1, 3) + ' kg');
    wrap_sensor.find('.img_stats .nvl_diff').text(number_random(1, 5) + '%');

    wrap_sensor.find('input[name=current_nvl]').val(current_nvl);
    wrap_sensor.find('.nvl_items').empty().html(nvl_items);
}

function photo_nvl(current_nvl) {
    var wrap_sensor = $('.wrap_sensor');

    switch (current_nvl) {
        case 'thit_bo':
            text_nvl = 'NVL_THIT001 - Thịt bò';
            wrap_sensor.find('.img_stats .img_1').attr('src', 'src/images/thit_bo.jpg');
            break;
        case 'thit_ga':
            text_nvl = 'NVL_THIT002 - Thịt gà';
            wrap_sensor.find('.img_stats .img_1').attr('src', 'src/images/thit_ga.jpg');
            break;
        case 'thit_heo':
            text_nvl = 'NVL_THIT003 - Thịt heo';
            wrap_sensor.find('.img_stats .img_1').attr('src', 'src/images/thit_heo.jpg');
            break;
        case 'tom_su':
            text_nvl = 'NVL_HS004 - Tôm sú';
            wrap_sensor.find('.img_stats .img_1').attr('src', 'src/images/tom_su.jpg');
            break;
        case 'muc_la':
            text_nvl = 'NVL_HS005 - Mực lá';
            wrap_sensor.find('.img_stats .img_1').attr('src', 'src/images/muc_la.jpg');
            break;
        default:
            text_nvl = '';
    }

    wrap_sensor.find('.img_stats .nvl_name').text(text_nvl);
    wrap_sensor.find('.img_stats .nvl_diff').text(number_random(1, 5) + '%');

    wrap_sensor.find('input[name=current_nvl]').val(current_nvl);
}

function photo_ok() {
    var wrap_sensor = $('.wrap_sensor');
    var wrap_saved = $('.wrap_saved');
    
    var current_nvl = wrap_sensor.find('input[name=current_nvl]').val();

    wrap_saved.find('.saved_item').addClass('d-none');
    wrap_saved.find('.nvl_' + current_nvl).removeClass('d-none');

    var count = wrap_saved.find('.nvl_' + current_nvl + ' table tbody tr').length + 1;
    var nvl_quantity = wrap_sensor.find('.img_stats .nvl_quantity').text();
    var nvl_diff = wrap_sensor.find('.img_stats .nvl_diff').text();

    var html = `<tr>
        <td class="nvl_info">
        <button class="btn btn-sm btn-danger me-2" onclick="nvl_remove(this)" type="button">
        <i class="fas fa-times"></i>
        </button> Cân lần <b>${count}</b>
        </td>
        <td class="text-center">${nvl_quantity}</td>
        <td class="text-center">${nvl_diff}</td>
    </tr>`;

    wrap_saved.find('.nvl_' + current_nvl + ' table tbody').append(html);
}

function nvl_view(nvl) {
    var wrap_saved = $('.wrap_saved');

    wrap_saved.find('.saved_item').addClass('d-none');
    wrap_saved.find('.nvl_' + nvl).removeClass('d-none');
}

function nvl_remove(ele) {
    var tr = $(ele).closest('tr');
    var table = $(ele).closest('table');

    tr.remove();

    if (table.find('tbody tr').length) {
        table.find('tbody tr').each(function (k, v) {
            $(v).find('.nvl_info b').text(k + 1);
        });
    }
}

function save_all() {
    var popup = $('#popup_save_all');
    var wrap_ncc = $('.wrap_ncc');
    var current_ncc = wrap_ncc.find('input[name=current_ncc]').val();

    if (!current_ncc || current_ncc == '') {
        toast_show('Vui lòng chọn nhà cung cấp trước khi xác nhận hoàn tất.', 'danger');
        return;
    }

    var html = '';

    html += `<div class="table-responsive">
        <table class="table table-bordered">
        <thead class="table-light">
        <tr>
        <th class="text-center">STT</th>
        <th class="text-center">NVL</th>
        <th class="text-center">Định lượng</th>
        <th class="text-center">Đơn vị</th>
        <th class="text-center">Sai số<br/>cho phép (%)</th>
        <th class="text-center">Định lượng<br/>cho phép</th>
        <th class="text-center">Định lượng<br/>thực tế</th>
        <th class="text-center">Trạng thái</th>
        </tr>
        </thead>
        <tbody>
        `;

    var html_status = '';
    if (current_ncc == 'meat') {

        po_meat.forEach(function(nvl, index) {
            var num = number_random(1, 2);
            if (num == 1) {
                html_status = `<div>
                <span class="me-2"><input type="radio" name="meat_${index}" value="ok" checked /><label class="ms-2">Nhập hàng</label></span>
                <span><input type="radio" name="meat_${index}" value="no" /><label class="ms-2">Trả hàng</label></span>
                </div>`;
            } else {
                html_status = `<div>
                <span class="me-2"><input type="radio" name="meat_${index}" value="ok"  /><label class="ms-2">Nhập hàng</label></span>
                <span><input type="radio" name="meat_${index}" value="no" checked /><label class="ms-2">Trả hàng</label></span>
                </div>`;
            }

            html += `
                <tr class="position-relative tr_${nvl.slug}">
                    <td class="text-center">${nvl.id}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                    <td class="text-center">${nvl.diff}</td>
                    <td class="text-center">${nvl.between}</td>
                    <td class="text-center">${nvl.real.toFixed(2)}</td>
                    <td class="text-center">${html_status}</td>
                </tr>
            `;
        });

    } else if (current_ncc == 'seafood') {

        po_seafood.forEach(function(nvl, index) {
            var num = number_random(1, 2);
            if (num == 1) {
                html_status = `<div>
                <span class="me-2"><input type="radio" name="seafood_${index}" value="ok" checked /><label class="ms-2">Nhập hàng</label></span>
                <span><input type="radio" name="seafood_${index}" value="no" /><label class="ms-2">Trả hàng</label></span>
                </div>`;
            } else {
                html_status = `<div>
                <span class="me-2"><input type="radio" name="seafood_${index}" value="ok"  /><label class="ms-2">Nhập hàng</label></span>
                <span><input type="radio" name="seafood_${index}" value="no" checked /><label class="ms-2">Trả hàng</label></span>
                </div>`;
            }

            html += `
                <tr class="position-relative tr_${nvl.slug}">
                    <td class="text-center">${nvl.id}</td>
                    <td class="text-center">${nvl.code} - ${nvl.name}</td>
                    <td class="text-center">${nvl.quantity.toFixed(2)}</td>
                    <td class="text-center">${nvl.unit}</td>
                    <td class="text-center">${nvl.diff}</td>
                    <td class="text-center">${nvl.between}</td>
                    <td class="text-center">${nvl.real.toFixed(2)}</td>
                    <td class="text-center">${html_status}</td>
                </tr>
            `;
        });
    }

    html += `</tbody>
        </table>
        </div>`;

    popup.find('.modal-body').empty().append(html);

    const modalEl = document.getElementById('popup_save_all');
    const myModal = new bootstrap.Modal(modalEl);
    myModal.show();
}

function save_confirm() {
    var wrap_po = $('.wrap_po');
    var wrap_sensor = $('.wrap_sensor');
    var wrap_saved = $('.wrap_saved');
    var wrap_ncc = $('.wrap_ncc');

    wrap_po.find('.datas_po').empty();

    wrap_sensor.find('.body_1').removeClass('d-none');
    wrap_sensor.find('.body_2').addClass('d-none');
    wrap_sensor.find('.img_photo img').attr('src', 'src/images/no_photo.png');

    wrap_saved.find('.saved_item').addClass('d-none');
    wrap_saved.find('.saved_item table tbody').empty();

    wrap_ncc.find('.ncc_code').text('');
    wrap_ncc.find('.ncc_name').text('');
    wrap_ncc.find('.ncc_phone').text('');

    wrap_ncc.find('input[name=current_ncc]').val('');
    wrap_ncc.find('select[name=ncc]').val('');
}