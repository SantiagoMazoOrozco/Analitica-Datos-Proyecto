import graphene

class Query(graphene.ObjectType):
    hello = graphene.String(name=graphene.String(default_value="stranger"))

    def resolve_hello(root, info, name):
        return f'Hello {name}'

schema = graphene.Schema(query=Query)
