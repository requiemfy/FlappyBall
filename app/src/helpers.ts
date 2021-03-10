
function backOnlyOnce(obj: any) {
  obj.props.navigation?.goBack();
  obj.backHandler.remove();
}

export { backOnlyOnce }