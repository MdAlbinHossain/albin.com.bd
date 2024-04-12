export const onRequestGet: PagesFunction = async (context) => {
    return fetch('https://albin.com.bd/assets/favicon.png');
}