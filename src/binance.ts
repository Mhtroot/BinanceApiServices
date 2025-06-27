import axios from 'axios';
import WebSocket from 'ws';

// Fix: REST API should use https:// protocol, not wss://
const BINANCE_WS = 'wss://ws-api.testnet.binance.vision/ws-api/v3'
const BINANCE_REST = 'https://testnet.binance.vision/api/v3'

export function subscribeToPrice(symbol: string, onMessage: (price: string) => void) {
    const ws = new WebSocket(BINANCE_WS);

    ws.on('open', () => {
        console.log(`WebSocket connected to ${symbol.toUpperCase()}`);

        // Subscribe to the trade stream using the proper method
        // const subscribeMsg = {
        //     method: "SUBSCRIBE",
        //     params: [`${symbol.toLowerCase()}@trade`],
        //     id: 1
        // };

        const subscribeMsg = {
            method: "avgPrice",
            params: {
                symbol: symbol.toUpperCase()
            },
            id: 1
        };
        // console.log(subscribeMsg);

        ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log("Received trade data:", msg);
        
        // if (msg.p === 1) {
        //     console.log(`Subscription response: ${JSON.stringify(msg)}`);
        //     return;
        // }

        // // Handle trade data
        // if (msg.e === 'trade' && msg.p) {
        //     onMessage(msg.p);
        // }

        if (msg.status === 200) {
            onMessage(msg.result.price);
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });

    ws.on('close', () => {
        console.log(`WebSocket connection to ${symbol.toUpperCase()} closed`);
    });

    return ws;
}

export async function isValidSymbol(symbol: string): Promise<boolean> {
    try {
        const response = await axios.get(`${BINANCE_REST}/exchangeInfo`);
        //console.log(response.data.symbols);
        
        const symbols = response.data.symbols.map((s: any) => s.symbol);
        return symbols.includes(symbol.toUpperCase());
    } catch (error) {
        console.error(`Error fetching exchange info: ${error.message}`);
        return false;
    }
}