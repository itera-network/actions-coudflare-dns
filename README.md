# Create or update DNSLink Action for GitHub

Create or update CloudFlare dnslink and gateway.

## Usage via Github Actions

Add [CF_API_TOKEN](https://developers.cloudflare.com/api/tokens/create) and CF_ZONE_ID to the [repository secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

```yaml
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: itera-network/actions-coudflare-dns@master
        with:
          name: "review.example.com"
          cid: "Qmaosiodjjkfjaklsjdkjklfjklajskjdklf" # cid will update txt record
          cname: "cloudflare-ipfs.com" # cname will update cname record
          token: ${{ secrets.CF_API_TOKEN }}
          zone: ${{ secrets.CF_ZONE_ID }}
```
**Use full qualified domain name to update if it exist**

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
