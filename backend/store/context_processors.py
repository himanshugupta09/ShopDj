def wishlist_count(request):
    count = 0
    if request.user.is_authenticated:
        try:
            count = request.user.wishlist.total_items()
        except:
            count = 0
    return {'wishlist_count': count}