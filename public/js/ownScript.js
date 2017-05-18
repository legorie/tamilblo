$(function(){
    $('#btn-like').on('click', function(event) {
        event.preventDefault();

        var postId = $(this).data('id');

        if (localStorage.getItem(postId) != "3-€çé") { //liked
        //$.get('/blog/post/' + postId + '?action=post.like' ).done(function(data) {
            $.get('?action=post.like' ).done(function(data) {
                $('.likes-count').text(parseInt($('.likes-count')[0].innerText)+1 );
                localStorage.setItem(postId, "3-€çé");
            });
        }
    });

});
