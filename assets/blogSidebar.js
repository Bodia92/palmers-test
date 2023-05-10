const getActivBlogLink = (root) => {
  const url = document.location.href;

  const blogSidebarLinks = root.querySelectorAll('.blog_tag_link');

  blogSidebarLinks.forEach(link => {
    if (link.href === url) {
      link.classList.add('blog_tag_link--active_page_mod')
    }
  });
}

window.addEventListener('load', (event) => {
	const $blogSidebar = document.querySelector('.blogSidebar');

  if (typeof ($blogSidebar) !== 'undefined' && $blogSidebar != null) {
    getActivBlogLink($blogSidebar);
  }

});
