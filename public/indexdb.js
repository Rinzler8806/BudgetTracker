let db;

const request = indexedDB.open("budgetDatabase", 1);

request.onupgradeneeded = ({
    target
}) => {
    const db = target.result;
    db.createObjectStore("budgetDatabase", {
        autoIncrement: true
    });
};

// This returns a result that we can then manipulate.
request.onsuccess = event => {
    db = event.target.result;
    console.log(request.result);


    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Sorry we could not access the database" + event.target.errorCode);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["budgetDatabase"], "readwrite");

    // access your pending object store
    const store = transaction.objectStore("budgetDatabase");

    // add record to your store with add method.
    store.add(record);
}

function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(["budgetDatabase"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("budgetDatabase");
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(["budgetDatabase"], "readwrite");

                    // access your pending object store
                    const store = transaction.objectStore("budgetDatabase");

                    // clear all items in your store
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);