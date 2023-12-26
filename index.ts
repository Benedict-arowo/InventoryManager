const nameInput = document.getElementById("input-name");
const priceInput = document.getElementById("input-price");
const amountInput = document.getElementById("input-amount");
const form = document.getElementById("form");
const tableBody = document.getElementById("tableBody");
const totalDisplay = document.getElementById("totalDisplay");
const idDisplay = document.getElementById("idDisplay");

let s;
class AccountListClass {
	constructor(list = []) {
		this._list = list;
		this._total = 0;
		this._id = 0;
	}

	get list() {
		return this._list;
	}

	get id() {
		return this._id;
	}

	get total() {
		return this._total;
	}

	set list(newList) {
		this._list = newList;
		newList.forEach((item) => (this._total += item.total));
	}

	remove(itemId) {
		const itemIndex = this._list.findIndex(
			(item) => item.id === Number(itemId)
		);
		if (itemIndex !== -1) {
			this._total -= this._list[itemIndex].total;
			this._list.splice(itemIndex, 1);
			return 0;
		} else throw new Error("Invalid ID provided.");
	}

	add(item) {
		this._list.push(item);
		this._total += item.total;
		// Increments the ID
		this._id++;
	}

	clear() {
		this._list = [];
	}
}

const accountList = new AccountListClass();

const resetEntries = () => {
	nameInput.value = "";
	priceInput.value = "";
	amountInput.value = "";
	return 0;
};

const displayItems = () => {
	const { list } = accountList;
	tableBody.innerHTML = "";
	list.map((item) => {
		const newChild = document.createElement("tr");
		newChild.setAttribute("data-id", item.id);
		newChild.innerHTML = `
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.amount}</td>
        <td>${item.total}</td>
        <td><button class="delete-btn"> Delete Item</button> </td>
      `;
		tableBody.appendChild(newChild);
	});

	const deleteButtons = document.querySelectorAll(".delete-btn");
	totalDisplay.innerText = accountList.total;

	deleteButtons.forEach((button) =>
		button.addEventListener("click", (e) => {
			accountList.remove(e.target.closest("tr").dataset.id);
			displayItems();
		})
	);

	saveToSession("accountList", accountList.list);
};

const saveToSession = (reference, data) => {
	sessionStorage.setItem(reference, JSON.stringify(data));
};

form.addEventListener("submit", (e) => {
	e.preventDefault();
	if (
		nameInput.value.length === 0 ||
		amountInput.value.length === 0 ||
		priceInput.value.length === 0
	)
		return;

	accountList.add({
		id: accountList.id,
		name: nameInput.value,
		price: priceInput.value,
		amount: amountInput.value,
		total: Number(priceInput.value) * Number(amountInput.value),
	});
	displayItems();
	resetEntries();
});

document.addEventListener("DOMContentLoaded", () => {
	const accountListInSession = JSON.parse(
		sessionStorage.getItem("accountList")
	);
	if (accountListInSession !== null) {
		accountList.list = accountListInSession;
		displayItems();
	}
});
