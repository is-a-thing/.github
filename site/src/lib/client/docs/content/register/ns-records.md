## ns records

to use your is-a-th.ing domain, you have to add NS records in the dashboard. there is a limit of 7 NS records per subdomain

> NS stands for ‘nameserver,’ and the nameserver record indicates which DNS server is authoritative for that domain (i.e. which server contains the actual DNS records). Basically, NS records tell the Internet where to go to find out a domain's IP address.
>
> - [cloudflare](https://www.cloudflare.com/learning/dns/dns-records/dns-ns-record/#:~:text=NS%20stands%20for%20'nameserver%2C',out%20a%20domain's%20IP%20address.)

not a lot of DNS services support subdomains, so you have to use a service that supports subdomains. once is-a-th.ing is in the public suffix list, this will likely not matter as you can use cloudflare for your DNS.

## DNS services that support subdomains

- [Hostry](hostry.com)
- [Dynu](dynu.com)
- [Hurricane Electric Free DNS](dns.he.net)
