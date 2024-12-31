const menuItems = [];

function showPopup(popupId) {
    document.getElementById(popupId).style.display = 'block';
    if (popupId === 'stockPopup') {
        populateStockDropdown();
    }
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

function addMoreFields() {
    const container = document.getElementById('inputContainer');
    const fieldSet = document.createElement('div');
    const itemInput = document.createElement('input');
    itemInput.type = 'text';
    itemInput.placeholder = 'Item';
    itemInput.name = 'item';
    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.placeholder = 'Price';
    priceInput.name = 'price';
    const stockInput = document.createElement('input');
    stockInput.type = 'text';
    stockInput.placeholder = 'Stock';
    stockInput.name = 'stock';
    fieldSet.appendChild(itemInput);
    fieldSet.appendChild(priceInput);
    fieldSet.appendChild(stockInput);
    container.appendChild(fieldSet);
}

function submitMenu() {
    const container = document.getElementById('inputContainer');
    const inputs = container.getElementsByTagName('input');
    const menuDiv = document.querySelector('.menu');
    const orderSelect = document.querySelector('.order select');
    for (let i = 0; i < inputs.length; i += 3) {
        const item = inputs[i].value;
        const price = inputs[i + 1].value;
        const stock = inputs[i + 2].value;
        if (item && price && stock) {
            const existingItem = menuItems.find(menuItem => menuItem.item === item);
            if (existingItem) {
                existingItem.stock += parseInt(stock);
                existingItem.price = price; // Update price if needed
                updateMenuStock(item, existingItem.stock, price);
            } else {
                const menuItem = document.createElement('div');
                menuItem.textContent = `${item} - $${price} (Stock: ${stock})`;
                menuItem.dataset.item = item;
                menuDiv.appendChild(menuItem);
                menuItems.push({ item, price, stock: parseInt(stock) });
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                orderSelect.appendChild(option);
            }
        }
    }
    closePopup('menuPopup');
}

function addOrderFields() {
    const container = document.getElementById('orderContainer');
    const fieldSet = document.createElement('div');
    const select = document.createElement('select');
    select.name = 'item';
    select.onchange = function() { updatePrice(this); };
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Item';
    select.appendChild(defaultOption);
    menuItems.forEach(menuItem => {
        const option = document.createElement('option');
        option.value = menuItem.item;
        option.textContent = menuItem.item;
        select.appendChild(option);
    });
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.placeholder = 'Quantity';
    quantityInput.name = 'quantity';
    quantityInput.oninput = function() { updatePrice(this); };
    const priceSpan = document.createElement('span');
    priceSpan.className = 'price';
    fieldSet.appendChild(select);
    fieldSet.appendChild(quantityInput);
    fieldSet.appendChild(priceSpan);
    container.appendChild(fieldSet);
}

function updatePrice(element) {
    const container = element.parentElement;
    const itemSelect = container.querySelector('select[name="item"]');
    const quantityInput = container.querySelector('input[name="quantity"]');
    const priceSpan = container.querySelector('.price');
    const selectedItem = menuItems.find(menuItem => menuItem.item === itemSelect.value);
    if (selectedItem) {
        const quantity = parseInt(quantityInput.value);
        if (quantity > selectedItem.stock) {
            priceSpan.textContent = 'Out Of Stock!';
        } else {
            priceSpan.textContent = `$${selectedItem.price * quantity}`;
        }
    } else {
        priceSpan.textContent = '';
    }
}

function placeOrder() {
    const orderContainer = document.getElementById('orderContainer');
    const selects = orderContainer.getElementsByTagName('select');
    const inputs = orderContainer.getElementsByTagName('input');
    const orderSummaryMap = new Map();
    let totalPrice = 0;

    for (let i = 0; i < selects.length; i++) {
        const item = selects[i].value;
        const quantity = parseInt(inputs[i].value);
        const selectedItem = menuItems.find(menuItem => menuItem.item === item);
        if (selectedItem) {
            if (quantity > selectedItem.stock) {
                orderSummaryMap.set(item, { price: 'Out Of Stock!', quantity: 0 });
            } else {
                if (orderSummaryMap.has(item)) {
                    const existingOrder = orderSummaryMap.get(item);
                    existingOrder.quantity += quantity;
                    existingOrder.price = selectedItem.price * existingOrder.quantity;
                } else {
                    orderSummaryMap.set(item, { price: selectedItem.price * quantity, quantity });
                }
                selectedItem.stock -= quantity;
                updateMenuStock(item, selectedItem.stock, selectedItem.price);
            }
        }
    }

    let orderSummary = '';
    orderSummaryMap.forEach((value, key) => {
        if (value.price === 'Out Of Stock!') {
            orderSummary += `<div>${key} - Out Of Stock!</div>`;
        } else {
            totalPrice += value.price;
            orderSummary += `<div>${key} - $${value.price} (Quantity: ${value.quantity})</div>`;
        }
    });

    orderSummary += `<div>Total Price: $${totalPrice}</div>`;
    document.getElementById('orderSummary').innerHTML = orderSummary;
    document.getElementById('orderPopup').style.display = 'block';
    resetOrderFields();
}

function updateMenuStock(item, newStock, price) {
    const menuDiv = document.querySelector('.menu');
    const menuItems = menuDiv.children;
    for (let i = 0; i < menuItems.length; i++) {
        if (menuItems[i].dataset.item === item) {
            menuItems[i].textContent = `${item} - $${price} (Stock: ${newStock})`;
            break;
        }
    }
}

function closeOrderPopup() {
    document.getElementById('orderPopup').style.display = 'none';
}

function populateStockDropdown() {
    const stockItemSelect = document.getElementById('stockItemSelect');
    stockItemSelect.innerHTML = '<option value="">Select Item</option>'; // Clear existing options
    menuItems.forEach(menuItem => {
        const option = document.createElement('option');
        option.value = menuItem.item;
        option.textContent = menuItem.item;
        stockItemSelect.appendChild(option);
    });
}

function submitStock() {
    const stockItemSelect = document.getElementById('stockItemSelect');
    const stockQuantityInput = document.getElementById('stockQuantityInput');
    const item = stockItemSelect.value;
    const quantity = parseInt(stockQuantityInput.value);
    const selectedItem = menuItems.find(menuItem => menuItem.item === item);
    if (selectedItem && quantity > 0) {
        selectedItem.stock += quantity;
        updateMenuStock(item, selectedItem.stock, selectedItem.price);
    }
    closePopup('stockPopup');
}

function resetSystem() {
    menuItems.length = 0;
    document.querySelector('.menu').innerHTML = '';
    document.querySelector('.order select').innerHTML = '<option value="">Select Item</option>';
    document.getElementById('orderContainer').innerHTML = `
        <div>
            <select name="item" onchange="updatePrice(this)">
                <option value="">Select Item</option>
            </select>
            <input type="number" placeholder="Quantity" name="quantity" oninput="updatePrice(this)">
            <span class="price"></span>
        </div>
    `;
    document.getElementById('orderSummary').innerHTML = '';
    document.getElementById('inputContainer').innerHTML = `
        <div>
            <input type="text" placeholder="Item" name="item">
            <input type="text" placeholder="Price" name="price">
            <input type="text" placeholder="Stock" name="stock">
        </div>
    `;
    document.getElementById('stockItemSelect').innerHTML = '<option value="">Select Item</option>';
    document.getElementById('stockQuantityInput').value = '';
}

function resetOrderFields() {
    const container = document.getElementById('orderContainer');
    container.innerHTML = `
        <div>
            <select name="item" onchange="updatePrice(this)">
                <option value="">Select Item</option>
            </select>
            <input type="number" placeholder="Quantity" name="quantity" oninput="updatePrice(this)">
            <span class="price"></span>
        </div>
    `;
    const select = container.querySelector('select[name="item"]');
    menuItems.forEach(menuItem => {
        const option = document.createElement('option');
        option.value = menuItem.item;
        option.textContent = menuItem.item;
        select.appendChild(option);
    });
}