const optionTypeElm = document.querySelector('[name=option-type]');
const transactionForm = document.querySelector('#pfbTransaction');
const blockHeightForm = document.querySelector('#blockHeight');

const renderSpinner = (container) => {
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');

    container.appendChild(spinner);
};

const removeSpinner = (container) => {
    const spinner = document.querySelector('.spinner');

    container.removeChild(spinner);
};

const switchForm = (type) => {
    if (type === 'pfbTransaction') {
        transactionForm.style.display = "block";
        blockHeightForm.style.display = "none";
    } else {
        transactionForm.style.display = "none";
        blockHeightForm.style.display = "block";
    }
};

optionTypeElm.addEventListener('change', (e) => {
    switchForm(e.target.value);
});

const transactionParcel = (recordId, values) => {
    const url = "https://celestia.onepiece-cosmos-explorer.xyz/submit_pfb";
    const payload = {
        namespace_id: recordId,
        data: values,
        gas_limit: 80000,
        fee: 2000,
    };

    renderSpinner(document.querySelector("#response"));

    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "text/plain"},
        body: JSON.stringify(payload),
    })
        .then((response) => response.json())
        .then((data) => {
            const tx_info = JSON.parse(JSON.stringify(data));
            const height = tx_info["height"];
            const txhash = tx_info["txhash"];
            renderResult('transaction', recordId, height, txhash, data);
        })
        .catch((error) => {
            console.error(error);
        }).finally(() => {
            removeSpinner(document.querySelector("#response"));
        });
};

const blockHeightParcel = (recordId, values) => {
    const url = `https://celestia.onepiece-cosmos-explorer.xyz/namespaced_shares/${recordId}/height/${values}`;

    renderSpinner(document.querySelector("#response"));

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const tx_info = JSON.parse(JSON.stringify(data));
            const height = tx_info["height"];
            renderResult('blockHeight', recordId, height, null, data);
        })
        .catch((error) => console.error(error))
        .finally(() => {
            removeSpinner(document.querySelector("#response"));
        });
};

const renderResult = (type, namespaceId, height, txHash, rawData) => {
    if (type === 'transaction') {
        document.querySelector("#response").innerHTML = `
            <h2>Your PFB data</h2>
            <p><h3> A. Your PFB transaction has submitted to blockchain with below data </h3></p>
            <p> - Namespace ID: <code><span style="color: red; font-size: 20px;"><b>${namespaceId}</b></span></code><p>
            <p> - Submitted block height: <code><span style="color: red; font-size: 20px;"><b>${height}</b></span></code><p>
            <p> - Transaction hash: <code><span style="color: red; font-size: 20px;"><b>${txHash}</b></span></code><p>
			<p> - FPB TXH link: <b><a href="https://testnet.mintscan.io/celestia-incentivized-testnet/txs/${txHash}"> PFB TXH link</a></b><p>
            <p><h3> B. Detail PFB transaction info:</h3></p>
            <textarea name="response" style="width: 100%; height: 300px; border: 1px solid #ccc; overflow: auto;">
                ${JSON.stringify(rawData, null, 2)}
            </textarea>
        `;
    } else {
        document.querySelector("#response").innerHTML = `
            <h2>A. Your Namespaced Shares Data</h2>
            <p> - Namespace ID: <code><span style="color: red; font-size: 20px;"><b>${namespaceId}</b></span></code><p>
            <p> - Submitted block height: <code><span style="color: red; font-size: 20px;"><b>${height}</b></span></code><p>
            <h2>B. Detail info:</h2>
            <textarea name="response" style="width: 100%; height: 300px; border: 1px solid #ccc; overflow: auto;">
                ${JSON.stringify(rawData, null, 2)}
            </textarea>
        `;
    }
};

document
    .querySelector("#submit_button")
    .addEventListener("click", (event) => {
        const selectedOptionType = optionTypeElm.value;
        const namespaceId = document.querySelector("[name=namespaceId]").value;
        const data = document.querySelector("[name=data]").value;
        const blockHeight = document.querySelector("[name=blockHeight]").value;

        document.querySelector("#response").innerHTML = '';

        if (selectedOptionType === 'pfbTransaction') {
            transactionParcel(namespaceId, data);
        } else {
            blockHeightParcel(namespaceId, blockHeight);
        }
    });
