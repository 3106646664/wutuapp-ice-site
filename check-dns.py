import dns.resolver
import dns.query
import dns.message
resolver = dns.resolver.Resolver()
resolver.lifetime = 8
for ns in resolver.resolve('wutuapp.com', 'NS'):
    name = str(ns.target)
    ip = str(resolver.resolve(name, 'A')[0])
    reply = dns.query.udp(dns.message.make_query('wutuapp.com', 'A'), ip, timeout=8)
    print(name, ip, reply.to_text())
